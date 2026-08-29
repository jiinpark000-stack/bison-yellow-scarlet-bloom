import { createFileRoute } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getToken, setToken } from "@/lib/session-client";
import { clearPrintJob, readPrintJob, webAuthnOrigin } from "@/lib/webauthn-client";
import {
  fingerprintRegisterBeginFn,
  fingerprintRegisterFinishFn,
  studentPrintLoginFn,
  studentPrintOptionsFn,
  studentPrintRegisterBeginFn,
  studentPrintRegisterFinishFn,
  teacherPrintLoginFn,
  teacherPrintOptionsFn,
} from "@/lib/fn/session";

export const Route = createFileRoute("/print-setup")({ component: PrintSetupPage });

function PrintSetupPage() {
  const job = readPrintJob();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(job ? "" : "지문 창을 설정에서 다시 열어 주세요.");
  const [done, setDone] = useState(false);

  const finish = (ok: boolean, extra?: { error?: string; token?: string }) => {
    if (!ok) {
      setErr(extra?.error || "지문을 쓰지 못했어요.");
      setBusy(false);
      return;
    }
    const payload = { type: "moyibank-print", id: job?.id, ok: true, token: extra?.token };
    try {
      window.opener?.postMessage(payload, window.location.origin);
    } catch {
      /* opener gone */
    }
    clearPrintJob();
    setDone(true);
    window.setTimeout(() => window.close(), 700);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 px-5 text-center">
      <Fingerprint className="size-10 text-primary" />
      <h1 className="font-display text-2xl font-semibold">선생님 지문</h1>
      <p className="text-sm text-muted">
        {done
          ? "완료했어요. 이 창을 닫아도 됩니다."
          : job?.kind === "login"
            ? "이 기기의 지문 또는 페이스아이디로 창구를 엽니다."
            : "이 기기의 지문 또는 페이스아이디를 등록합니다."}
      </p>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {!done ? (
        <Button
          disabled={busy || !job}
          onClick={async () => {
            if (!job) return;
            setBusy(true);
            setErr("");
            const origin = webAuthnOrigin();
            try {
              if (job.kind === "register") {
                const token = getToken("teacher");
                if (!token) throw new Error("선생님으로 다시 들어온 뒤 등록해 주세요.");
                const { startRegistration } = await import("@simplewebauthn/browser");
                const options = await fingerprintRegisterBeginFn({ data: { token, origin } });
                const response = await startRegistration({ optionsJSON: options });
                await fingerprintRegisterFinishFn({ data: { token, response, label: job.label, origin } });
                finish(true);
              } else if (job.kind === "student-register") {
                const token = getToken("teacher") || getToken("student");
                if (!token) throw new Error("다시 들어온 뒤 등록해 주세요.");
                const { startRegistration } = await import("@simplewebauthn/browser");
                const options = await studentPrintRegisterBeginFn({
                  data: { token, studentId: job.studentId, origin },
                });
                const response = await startRegistration({ optionsJSON: options });
                await studentPrintRegisterFinishFn({
                  data: { token, studentId: job.studentId, response, label: job.label, origin },
                });
                finish(true);
              } else if (job.kind === "student-login") {
                if (!job.studentId) throw new Error("학생을 다시 골라 주세요.");
                const { startAuthentication } = await import("@simplewebauthn/browser");
                const options = await studentPrintOptionsFn({ data: { studentId: job.studentId, origin } });
                const response = await startAuthentication({ optionsJSON: options });
                const res = await studentPrintLoginFn({
                  data: { studentId: job.studentId, response, origin },
                });
                setToken("student", res.token);
                finish(true, { token: res.token });
              } else {
                const { startAuthentication } = await import("@simplewebauthn/browser");
                const options = await teacherPrintOptionsFn({ data: { origin } });
                const response = await startAuthentication({ optionsJSON: options });
                const res = await teacherPrintLoginFn({ data: { response, origin } });
                setToken("teacher", res.token);
                finish(true, { token: res.token });
              }
            } catch (e) {
              setErr(e instanceof Error ? e.message : "지문을 쓰지 못했어요.");
              setBusy(false);
            }
          }}
        >
          {busy ? "확인 중…" : job?.kind === "login" ? "지문으로 열기" : "지문 등록"}
        </Button>
      ) : null}
    </main>
  );
}
