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

const JOB_KEY = "moyibank.printJob";

export function webAuthnOrigin() {
  return window.location.origin;
}

function inIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function webAuthnMessage(err: unknown): string {
  const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (name === "NotAllowedError" || msg.includes("NotAllowedError")) {
    return inIframe()
      ? "미리보기 창에서는 지문이 막혀 있어요. 새 창에서 한 번 더 눌러 주세요."
      : "지문 창이 닫혔어요. 다시 눌러 주세요.";
  }
  if (name === "SecurityError" || msg.toLowerCase().includes("security")) {
    return "이 화면에서는 지문을 쓸 수 없어요. 게시한 사이트나 새 창에서 등록해 주세요.";
  }
  if (name === "InvalidStateError") return "이 기기 지문은 이미 등록되어 있어요.";
  if (name === "NotSupportedError") return "이 브라우저는 지문을 지원하지 않아요. 크롬이나 사파리를 써 주세요.";
  if (msg.includes("publickey") || msg.includes("relying party") || msg.includes("rpID")) {
    return "이 주소에서는 지문이 막혀 있어요. 게시한 사이트나 휴대폰에서 등록해 주세요.";
  }
  return msg || "지문을 쓰지 못했어요.";
}

function isBlocked(err: unknown) {
  const text = `${err instanceof Error ? err.name : ""} ${err instanceof Error ? err.message : String(err)}`;
  return /NotAllowedError|SecurityError|publickey|iframe|not allowed|rpID|relying party/i.test(text);
}

type PrintJob = {
  id: string;
  kind: "register" | "login" | "student-register" | "student-login";
  label?: string;
  studentId?: number;
};

function popupJob(job: Omit<PrintJob, "id">): Promise<{ token?: string }> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);
    localStorage.setItem(JOB_KEY, JSON.stringify({ ...job, id } satisfies PrintJob));
    const child = window.open("/print-setup", "moyibank-print", "width=420,height=640");
    if (!child) {
      localStorage.removeItem(JOB_KEY);
      reject(new Error("팝업이 막혔어요. 브라우저에서 팝업을 허용해 주세요."));
      return;
    }
    const onMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; id?: string; ok?: boolean; error?: string; token?: string };
      if (data?.type !== "moyibank-print" || data.id !== id) return;
      cleanup();
      if (data.ok) resolve({ token: data.token });
      else reject(new Error(data.error || "지문을 쓰지 못했어요."));
    };
    const timer = window.setInterval(() => {
      if (child.closed) {
        cleanup();
        reject(new Error("지문 창이 닫혔어요."));
      }
    }, 400);
    const cleanup = () => {
      window.removeEventListener("message", onMsg);
      window.clearInterval(timer);
    };
    window.addEventListener("message", onMsg);
  });
}

export async function registerTeacherFingerprint(token: string, label?: string) {
  const origin = webAuthnOrigin();
  const run = async () => {
    const { startRegistration, browserSupportsWebAuthn } = await import("@simplewebauthn/browser");
    if (!browserSupportsWebAuthn()) throw new Error("이 브라우저는 지문을 지원하지 않아요.");
    const options = await fingerprintRegisterBeginFn({ data: { token, origin } });
    const response = await startRegistration({ optionsJSON: options });
    await fingerprintRegisterFinishFn({ data: { token, response, label, origin } });
  };
  try {
    await run();
  } catch (err) {
    if (inIframe() && isBlocked(err)) {
      await popupJob({ kind: "register", label });
      return;
    }
    throw new Error(webAuthnMessage(err));
  }
}

export async function loginTeacherFingerprint() {
  const origin = webAuthnOrigin();
  const run = async () => {
    const { startAuthentication, browserSupportsWebAuthn } = await import("@simplewebauthn/browser");
    if (!browserSupportsWebAuthn()) throw new Error("이 브라우저는 지문을 지원하지 않아요.");
    const options = await teacherPrintOptionsFn({ data: { origin } });
    const response = await startAuthentication({ optionsJSON: options });
    return teacherPrintLoginFn({ data: { response, origin } });
  };
  try {
    return await run();
  } catch (err) {
    if (inIframe() && isBlocked(err)) {
      return popupJob({ kind: "login" }) as Promise<{ token: string }>;
    }
    throw new Error(webAuthnMessage(err));
  }
}

export async function registerStudentFingerprint(token: string, label?: string, studentId?: number) {
  const origin = webAuthnOrigin();
  const run = async () => {
    const { startRegistration, browserSupportsWebAuthn } = await import("@simplewebauthn/browser");
    if (!browserSupportsWebAuthn()) throw new Error("이 브라우저는 지문을 지원하지 않아요.");
    const options = await studentPrintRegisterBeginFn({ data: { token, studentId, origin } });
    const response = await startRegistration({ optionsJSON: options });
    await studentPrintRegisterFinishFn({ data: { token, studentId, response, label, origin } });
  };
  try {
    await run();
  } catch (err) {
    if (inIframe() && isBlocked(err)) {
      await popupJob({ kind: "student-register", label, studentId });
      return;
    }
    throw new Error(webAuthnMessage(err));
  }
}

export async function loginStudentFingerprint(studentId: number) {
  const origin = webAuthnOrigin();
  const run = async () => {
    const { startAuthentication, browserSupportsWebAuthn } = await import("@simplewebauthn/browser");
    if (!browserSupportsWebAuthn()) throw new Error("이 브라우저는 지문을 지원하지 않아요.");
    const options = await studentPrintOptionsFn({ data: { studentId, origin } });
    const response = await startAuthentication({ optionsJSON: options });
    return studentPrintLoginFn({ data: { studentId, response, origin } });
  };
  try {
    return await run();
  } catch (err) {
    if (inIframe() && isBlocked(err)) {
      return popupJob({ kind: "student-login", studentId }) as Promise<{ token: string }>;
    }
    throw new Error(webAuthnMessage(err));
  }
}

export function readPrintJob(): PrintJob | null {
  try {
    const raw = localStorage.getItem(JOB_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PrintJob;
  } catch {
    return null;
  }
}

export function clearPrintJob() {
  localStorage.removeItem(JOB_KEY);
}
