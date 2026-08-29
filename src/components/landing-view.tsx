import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Fingerprint, Landmark, LockKeyhole, ScanFace, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FaceScan } from "@/components/face-scan";
import { PassbookMark } from "@/components/passbook-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPublicClass, studentFaceLoginFn, studentLoginFn, teacherFaceLoginFn, teacherLoginFn } from "@/lib/fn/session";
import { setToken } from "@/lib/session-client";
import { DEFAULT_TEACHER_PASSWORD } from "@/lib/types";

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.";
}

export function LandingView() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["public-class"],
    queryFn: () => getPublicClass(),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const [mode, setMode] = useState<"pick" | "teacher">("pick");
  const [selected, setSelected] = useState<{
    id: number;
    name: string;
    faceReady?: boolean;
    printReady?: boolean;
  } | null>(null);
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [faceScan, setFaceScan] = useState(false);
  const [studentFace, setStudentFace] = useState(false);

  const enterStudent = (res: { token: string }) => {
    setToken("student", res.token);
    toast.success(`${selected?.name} 통장이 열렸어요.`);
    void navigate({ to: "/play" });
  };

  const studentLogin = useMutation({
    mutationFn: () => studentLoginFn({ data: { studentId: selected!.id, pin } }),
    onSuccess: enterStudent,
    onError: (e) => toast.error(errMsg(e)),
  });
  const studentFaceMut = useMutation({
    mutationFn: (descriptor: number[] | number[][]) =>
      studentFaceLoginFn({ data: { studentId: selected!.id, descriptor } }),
    onSuccess: (res) => {
      setStudentFace(false);
      enterStudent(res);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const enterTeacher = (res: { token: string }) => {
    setToken("teacher", res.token);
    toast.success("선생님 창구에 들어왔어요.");
    void navigate({ to: "/teacher" });
  };

  const teacherLogin = useMutation({
    mutationFn: () => teacherLoginFn({ data: { password } }),
    onSuccess: enterTeacher,
    onError: (e) => toast.error(errMsg(e)),
  });
  const teacherFace = useMutation({
    mutationFn: (descriptor: number[] | number[][]) => teacherFaceLoginFn({ data: { descriptor } }),
    onSuccess: (res) => {
      setFaceScan(false);
      enterTeacher(res);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const className = data?.className ?? "6학년 5반";

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-8 sm:py-12">
      <div className="stagger-in">
        <p className="text-sm font-medium tracking-wide text-primary">{className} · 금융놀이</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">모이뱅크</h1>
            <p className="mt-3 max-w-md text-muted">
              실제 주식의 오르내림은 그대로, 살 수 있는 가격만 1/1,000로 줄인 학급 투자 통장.
              간식은 여기서 사고 학교에서 받아요.
            </p>
          </div>
          <PassbookMark className="hidden size-24 shrink-0 sm:block" />
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("pick")}
          className={`rounded-xl border p-5 text-left transition-colors ${
            mode === "pick" ? "border-primary bg-surface" : "border-border bg-surface-2"
          }`}
        >
          <Users className="size-5 text-primary" />
          <p className="mt-3 font-display text-lg font-semibold">학생 입장</p>
          <p className="mt-1 text-sm text-muted">내 이름을 고르고 숫자 비밀번호를 입력해요.</p>
        </button>
        <button
          type="button"
          onClick={() => setMode("teacher")}
          className={`rounded-xl border p-5 text-left transition-colors ${
            mode === "teacher" ? "border-primary bg-surface" : "border-border bg-surface-2"
          }`}
        >
          <Landmark className="size-5 text-primary" />
          <p className="mt-3 font-display text-lg font-semibold">선생님 창구</p>
          <p className="mt-1 text-sm text-muted">얼굴, 지문, 비밀번호로 창구를 열어요.</p>
        </button>
      </div>

      {mode === "teacher" ? (
        <Card className="mt-6">
          <CardContent className="p-5">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                teacherLogin.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="teacher-pw">선생님 비밀번호</Label>
                <Input
                  id="teacher-pw"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                />
                {data && !data.passwordChanged ? (
                  <p className="text-sm text-muted">
                    처음 비밀번호는 <span className="font-medium text-fg">{DEFAULT_TEACHER_PASSWORD}</span>{" "}
                    예요. 들어간 뒤 꼭 바꿔 주세요.
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={teacherLogin.isPending}>
                {teacherLogin.isPending ? "확인 중…" : "비밀번호로 열기"}
              </Button>
              <p className="text-center text-xs text-muted">또는</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!data?.faceReady}
                  onClick={() => setFaceScan(true)}
                >
                  <ScanFace className="size-4" />
                  얼굴로 열기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!data?.printReady}
                  onClick={async () => {
                    try {
                      const { loginTeacherFingerprint } = await import("@/lib/webauthn-client");
                      const res = await loginTeacherFingerprint();
                      if (!res?.token) throw new Error("지문으로 열지 못했어요.");
                      enterTeacher(res);
                    } catch (e) {
                      toast.error(errMsg(e));
                    }
                  }}
                >
                  <Fingerprint className="size-4" />
                  지문으로 열기
                </Button>
              </div>
              {!data?.faceReady || !data?.printReady ? (
                <p className="text-xs text-muted">
                  얼굴·지문은 비밀번호로 들어간 뒤 설정 탭에서 등록해요.
                </p>
              ) : null}
              {faceScan ? (
                <FaceScan
                  mode="unlock"
                  busy={teacherFace.isPending}
                  onCancel={() => setFaceScan(false)}
                  onCapture={(descriptor) => teacherFace.mutate(descriptor)}
                />
              ) : null}
            </form>
          </CardContent>
        </Card>
      ) : (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">우리 반</h2>
            <p className="text-sm text-muted">{data?.students.length ?? 0}명</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-bg-sunken" />
              ))}
            </div>
          ) : data?.students.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {data.students.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelected(s);
                    setPin("");
                  }}
                  className="h-14 rounded-lg border border-border bg-surface px-3 text-left font-medium transition-colors hover:border-primary hover:bg-surface-2"
                >
                  {s.name}
                </button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted">
                아직 등록된 친구가 없어요. 선생님이 창구에서 이름을 넣어 주면 여기서 입장할 수 있어요.
              </CardContent>
            </Card>
          )}
        </section>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              비밀번호, 얼굴, 지문 중 하나로 자기 통장만 열 수 있어요. 얼굴은 선생님 창구와 같이 배경을 보지 않아요.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              studentLogin.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="pin">비밀번호</Label>
              <Input
                id="pin"
                inputMode="numeric"
                autoComplete="off"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="숫자 4자리"
              />
            </div>
            <Button type="submit" className="w-full" disabled={pin.length < 4 || studentLogin.isPending}>
              <LockKeyhole className="size-4" />
              {studentLogin.isPending ? "여는 중…" : "비밀번호로 열기"}
            </Button>
            <p className="text-center text-xs text-muted">또는</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                disabled={!selected?.faceReady}
                onClick={() => setStudentFace(true)}
              >
                <ScanFace className="size-4" />
                얼굴로 열기
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!selected?.printReady}
                onClick={async () => {
                  if (!selected) return;
                  try {
                    const { loginStudentFingerprint } = await import("@/lib/webauthn-client");
                    const res = await loginStudentFingerprint(selected.id);
                    if (!res?.token) throw new Error("지문으로 열지 못했어요.");
                    enterStudent(res);
                  } catch (e) {
                    toast.error(errMsg(e));
                  }
                }}
              >
                <Fingerprint className="size-4" />
                지문으로 열기
              </Button>
            </div>
            {!selected?.faceReady || !selected?.printReady ? (
              <p className="text-xs text-muted">얼굴·지문은 통장에 들어간 뒤 등록하거나, 선생님이 학급 탭에서 넣어 줄 수 있어요.</p>
            ) : null}
            {studentFace ? (
              <FaceScan
                mode="unlock"
                busy={studentFaceMut.isPending}
                onCancel={() => setStudentFace(false)}
                onCapture={(descriptor) => studentFaceMut.mutate(descriptor)}
              />
            ) : null}
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
