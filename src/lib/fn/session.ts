import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { ensureSeeded } from "@/lib/server/seed.server";
import {
  changeTeacherPassword,
  destroySession,
  loadSession,
  lockVault,
  loginStudent,
  loginStudentWithFace,
  loginStudentWithFingerprint,
  loginTeacher,
  loginTeacherWithFace,
  loginTeacherWithFingerprint,
  readToken,
  unlockVaultWithFace,
  unlockVaultWithPassword,
} from "@/lib/server/session.server";

const faceUnlock = z.array(z.number()).min(24);

export const getPublicClass = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const sql = await getSql();
  const settings = await sql<{ class_name: string; password_changed: boolean }>`
    select class_name, password_changed from settings where id = 1
  `;
  const students = await sql<{ id: number; name: string; face_ready: boolean; print_ready: boolean }>`
    select s.id, s.name,
      exists(select 1 from student_faces f where f.student_id = s.id) as face_ready,
      exists(select 1 from student_webauthn w where w.student_id = s.id) as print_ready
    from students s
    order by s.name
  `;
  const { hasVaultFace } = await import("@/lib/server/vault.server");
  const { hasFingerprint } = await import("@/lib/server/webauthn.server");
  const [faceReady, printReady] = await Promise.all([hasVaultFace(), hasFingerprint()]);
  return {
    className: settings[0]?.class_name ?? "6학년 5반",
    passwordChanged: Boolean(settings[0]?.password_changed),
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      faceReady: Boolean(s.face_ready),
      printReady: Boolean(s.print_ready),
    })),
    faceReady,
    printReady,
  };
});

export const getSession = createServerFn({ method: "GET" })
  .validator((d) => z.object({ token: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data }) => {
    return loadSession(data.token);
  });

export const teacherLoginFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ password: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => loginTeacher(data.password));

export const teacherFaceLoginFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ descriptor: faceUnlock }).parse(d))
  .handler(async ({ data }) => loginTeacherWithFace(data.descriptor));

export const teacherPrintOptionsFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ origin: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data }) => {
    const { beginFingerprintLogin } = await import("@/lib/server/webauthn.server");
    return beginFingerprintLogin(data.origin);
  });

export const teacherPrintLoginFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ response: z.unknown(), origin: z.string().optional() }).parse(d))
  .handler(async ({ data }) => loginTeacherWithFingerprint(data.response, data.origin));

export const fingerprintRegisterBeginFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), origin: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data }) => {
    const { requireTeacher } = await import("@/lib/server/session.server");
    const { beginFingerprintRegister } = await import("@/lib/server/webauthn.server");
    await requireTeacher(data.token);
    return beginFingerprintRegister(data.origin);
  });

export const fingerprintRegisterFinishFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        response: z.unknown(),
        label: z.string().optional(),
        origin: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireTeacher } = await import("@/lib/server/session.server");
    const { finishFingerprintRegister } = await import("@/lib/server/webauthn.server");
    await requireTeacher(data.token);
    return finishFingerprintRegister(data.response as never, data.label, data.origin);
  });

export const removeFingerprintFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { requireTeacher } = await import("@/lib/server/session.server");
    const { removeFingerprint } = await import("@/lib/server/webauthn.server");
    await requireTeacher(data.token);
    return removeFingerprint(data.id);
  });

export const studentLoginFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ studentId: z.number().int(), pin: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => loginStudent(data.studentId, data.pin));

export const studentFaceLoginFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ studentId: z.number().int(), descriptor: faceUnlock }).parse(d),
  )
  .handler(async ({ data }) => loginStudentWithFace(data.studentId, data.descriptor));

export const studentPrintOptionsFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ studentId: z.number().int(), origin: z.string().optional() }).parse(d))
  .handler(async ({ data }) => {
    const { beginStudentPrintLogin } = await import("@/lib/server/student-bio.server");
    return beginStudentPrintLogin(data.studentId, data.origin);
  });

export const studentPrintLoginFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({ studentId: z.number().int(), response: z.unknown(), origin: z.string().optional() })
      .parse(d),
  )
  .handler(async ({ data }) => loginStudentWithFingerprint(data.studentId, data.response, data.origin));

export const studentPrintRegisterBeginFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        studentId: z.number().int().optional(),
        origin: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const studentId = await bioStudentId(data.token, data.studentId);
    const { beginStudentPrintRegister } = await import("@/lib/server/student-bio.server");
    return beginStudentPrintRegister(studentId, data.origin);
  });

export const studentPrintRegisterFinishFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        studentId: z.number().int().optional(),
        response: z.unknown(),
        label: z.string().optional(),
        origin: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const studentId = await bioStudentId(data.token, data.studentId);
    const { finishStudentPrintRegister } = await import("@/lib/server/student-bio.server");
    return finishStudentPrintRegister(studentId, data.response as never, data.label, data.origin);
  });

export const registerStudentFaceFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        studentId: z.number().int().optional(),
        descriptor: z.array(z.number()).min(24),
        label: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const studentId = await bioStudentId(data.token, data.studentId);
    const { addStudentFace } = await import("@/lib/server/student-bio.server");
    return addStudentFace(studentId, data.descriptor, data.label);
  });

export const removeStudentFaceFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({ token: z.string().optional(), studentId: z.number().int().optional(), id: z.number().int() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const studentId = await bioStudentId(data.token, data.studentId);
    const { removeStudentFace } = await import("@/lib/server/student-bio.server");
    return removeStudentFace(studentId, data.id);
  });

export const removeStudentPrintFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({ token: z.string().optional(), studentId: z.number().int().optional(), id: z.number().int() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const studentId = await bioStudentId(data.token, data.studentId);
    const { removeStudentPrint } = await import("@/lib/server/student-bio.server");
    return removeStudentPrint(studentId, data.id);
  });

async function bioStudentId(token?: string, requested?: number) {
  const { loadSession } = await import("@/lib/server/session.server");
  const session = await loadSession(token);
  if (!session) throw new Error("로그인해 주세요.");
  if (session.role === "teacher") {
    if (!requested) throw new Error("학생을 골라 주세요.");
    return requested;
  }
  if (session.role === "student") {
    if (requested && requested !== session.student.id) {
      throw new Error("다른 친구 통장에는 등록할 수 없어요.");
    }
    return session.student.id;
  }
  throw new Error("로그인해 주세요.");
}

export const logoutFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data }) => {
    const token = await readToken(data.token);
    await destroySession(token);
    return { ok: true as const };
  });

export const changeTeacherPasswordFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        current: z.string().min(1),
        next: z.string().min(4),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    changeTeacherPassword(data.token ?? "", data.current, data.next),
  );

export const registerVaultFaceFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        descriptor: z.array(z.number()).min(24),
        label: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireTeacher } = await import("@/lib/server/session.server");
    const { addVaultFace } = await import("@/lib/server/vault.server");
    await requireTeacher(data.token);
    return addVaultFace(data.descriptor, data.label);
  });

export const removeVaultFaceFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { requireTeacher } = await import("@/lib/server/session.server");
    const { removeVaultFace } = await import("@/lib/server/vault.server");
    await requireTeacher(data.token);
    return removeVaultFace(data.id);
  });

export const unlockVaultFaceFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ token: z.string().optional(), descriptor: faceUnlock }).parse(d),
  )
  .handler(async ({ data }) => unlockVaultWithFace(data.token, data.descriptor));

export const unlockVaultPasswordFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ token: z.string().optional(), password: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => unlockVaultWithPassword(data.token, data.password));

export const lockVaultFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data }) => lockVault(data.token));
