import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { hashSecret, randomToken, verifySecret } from "@/lib/server/crypto.server";
import { ensureSeeded } from "@/lib/server/seed.server";
import { num } from "@/lib/utils";
import type { SessionInfo, StudentPublic } from "@/lib/types";

const COOKIE = "mb_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 30;

type SessionRow = {
  token: string;
  role: string;
  student_id: number | null;
  expires_at: string;
  vault_until: string | null;
};

export async function readToken(bodyToken?: string): Promise<string> {
  const fromBody = bodyToken?.trim();
  if (fromBody) return fromBody;
  return getCookie(COOKIE) ?? "";
}

function writeCookie(token: string) {
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function clearCookie() {
  deleteCookie(COOKIE, { path: "/" });
}

async function studentPublic(id: number): Promise<StudentPublic | null> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    name: string;
    cash: unknown;
    savings: unknown;
    last_salary_on: string | null;
    last_interest_on: string | null;
    tax_due: unknown;
    job_name: string | null;
    salary: unknown;
  }>`
    select s.id, s.name, s.cash, s.savings, s.last_salary_on, s.last_interest_on, s.tax_due, j.name as job_name, j.salary
    from students s
    left join jobs j on j.id = s.job_id
    where s.id = ${id}
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    jobName: row.job_name,
    salary: num(row.salary),
    cash: num(row.cash),
    savings: num(row.savings),
    lastSalaryOn: row.last_salary_on,
    lastInterestOn: row.last_interest_on,
    taxDue: num(row.tax_due),
  };
}

export async function createSession(role: "teacher" | "student", studentId?: number) {
  const sql = await getSql();
  const token = randomToken();
  const expires = new Date(Date.now() + TTL_MS).toISOString();
  await sql`
    insert into sessions (token, role, student_id, expires_at)
    values (${token}, ${role}, ${studentId ?? null}, ${expires})
  `;
  writeCookie(token);
  return token;
}

export async function destroySession(token: string) {
  if (!token) return;
  const sql = await getSql();
  await sql`delete from sessions where token = ${token}`;
  clearCookie();
}

export async function loadSession(bodyToken?: string): Promise<SessionInfo | null> {
  await ensureSeeded();
  const token = await readToken(bodyToken);
  if (!token) return null;
  const sql = await getSql();
  const rows = await sql<SessionRow>`
    select token, role, student_id, expires_at::text as expires_at, vault_until::text as vault_until
    from sessions
    where token = ${token}
  `;
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await sql`delete from sessions where token = ${token}`;
    return null;
  }
  const settings = await sql<{ class_name: string; password_changed: boolean }>`
    select class_name, password_changed from settings where id = 1
  `;
  const className = settings[0]?.class_name ?? "6학년 5반";
  if (row.role === "teacher") {
    const vaultUntil = row.vault_until ? new Date(row.vault_until).getTime() : 0;
    return {
      role: "teacher",
      className,
      passwordChanged: Boolean(settings[0]?.password_changed),
      vaultUnlocked: Boolean(row.vault_until) && !Number.isNaN(vaultUntil),
    };
  }
  if (!row.student_id) return null;
  const student = await studentPublic(row.student_id);
  if (!student) return null;
  return { role: "student", className, student };
}

export async function requireTeacher(bodyToken?: string) {
  const session = await loadSession(bodyToken);
  if (!session || session.role !== "teacher") {
    throw new Error("선생님으로 로그인해 주세요.");
  }
  return session;
}

export async function requireStudent(bodyToken?: string) {
  const session = await loadSession(bodyToken);
  if (!session || session.role !== "student") {
    throw new Error("학생으로 로그인해 주세요.");
  }
  return session;
}

export async function requireVaultOpen(bodyToken?: string) {
  const session = await requireTeacher(bodyToken);
  if (!session.vaultUnlocked) {
    throw new Error("학급 창고가 잠겨 있어요. 세금 탭에서 얼굴이나 비밀번호로 열어 주세요.");
  }
  return session;
}

export async function loginTeacher(password: string) {
  await ensureSeeded();
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen("teacher-password");
  const sql = await getSql();
  const rows = await sql<{ teacher_password_hash: string }>`
    select teacher_password_hash from settings where id = 1
  `;
  const hash = rows[0]?.teacher_password_hash;
  if (!hash || !(await verifySecret(password, hash))) {
    await noteBioFail("teacher-password", "비밀번호를");
    throw new Error("비밀번호가 올바르지 않아요.");
  }
  await noteBioOk("teacher-password");
  const token = await createSession("teacher");
  const session = await loadSession(token);
  return { token, session };
}

export async function loginTeacherWithFace(descriptor: number[] | number[][]) {
  await ensureSeeded();
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen("teacher-face");
  const { bestStudentFaceScore } = await import("@/lib/server/student-bio.server");
  const { matchVaultFace, teacherFaceScore } = await import("@/lib/server/vault.server");
  const [studentScore, teacherScore, matched] = await Promise.all([
    bestStudentFaceScore(descriptor),
    teacherFaceScore(descriptor),
    matchVaultFace(descriptor),
  ]);
  const studentWins = studentScore <= 0.12 && studentScore + 0.1 < teacherScore;
  if (studentWins || !matched) {
    await noteBioFail("teacher-face", "얼굴을");
    throw new Error("얼굴을 확인하지 못했어요. 타원에 맞추거나 비밀번호를 써 주세요.");
  }
  await noteBioOk("teacher-face");
  const token = await createSession("teacher");
  const session = await loadSession(token);
  return { token, session };
}

export async function loginTeacherWithFingerprint(response: unknown, origin?: string) {
  await ensureSeeded();
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen("teacher-print");
  const credId = response && typeof response === "object" && "id" in response ? String((response as { id: unknown }).id) : "";
  const { isStudentFingerprint } = await import("@/lib/server/student-bio.server");
  try {
    if (await isStudentFingerprint(credId)) throw new Error("no");
    const { finishFingerprintLogin } = await import("@/lib/server/webauthn.server");
    await finishFingerprintLogin(response as Parameters<typeof finishFingerprintLogin>[0], origin);
  } catch {
    await noteBioFail("teacher-print", "지문을");
    throw new Error("지문을 확인하지 못했어요. 비밀번호를 써 주세요.");
  }
  await noteBioOk("teacher-print");
  const token = await createSession("teacher");
  const session = await loadSession(token);
  return { token, session };
}

async function openVaultSession(bodyToken?: string) {
  const token = await readToken(bodyToken);
  const sql = await getSql();
  await sql`update sessions set vault_until = now() where token = ${token}`;
  return { ok: true as const };
}

export async function unlockVaultWithFace(bodyToken: string | undefined, descriptor: number[] | number[][]) {
  await requireTeacher(bodyToken);
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen("vault-face");
  const { bestStudentFaceScore } = await import("@/lib/server/student-bio.server");
  const { matchVaultFace, teacherFaceScore } = await import("@/lib/server/vault.server");
  const [studentScore, teacherScore, matched] = await Promise.all([
    bestStudentFaceScore(descriptor),
    teacherFaceScore(descriptor),
    matchVaultFace(descriptor),
  ]);
  const studentWins = studentScore <= 0.12 && studentScore + 0.1 < teacherScore;
  if (studentWins || !matched) {
    await noteBioFail("vault-face", "얼굴을");
    throw new Error("얼굴을 확인하지 못했어요. 타원에 맞추거나 비밀번호를 써 주세요.");
  }
  await noteBioOk("vault-face");
  return openVaultSession(bodyToken);
}

export async function unlockVaultWithPassword(bodyToken: string | undefined, password: string) {
  await requireTeacher(bodyToken);
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen("vault-password");
  const sql = await getSql();
  const rows = await sql<{ teacher_password_hash: string }>`
    select teacher_password_hash from settings where id = 1
  `;
  const hash = rows[0]?.teacher_password_hash;
  if (!hash || !(await verifySecret(password, hash))) {
    await noteBioFail("vault-password", "비밀번호를");
    throw new Error("비밀번호가 올바르지 않아요.");
  }
  await noteBioOk("vault-password");
  return openVaultSession(bodyToken);
}

export async function lockVault(bodyToken?: string) {
  await requireTeacher(bodyToken);
  const token = await readToken(bodyToken);
  const sql = await getSql();
  await sql`update sessions set vault_until = null where token = ${token}`;
  return { ok: true as const };
}

export async function changeTeacherPassword(token: string, current: string, next: string) {
  await requireTeacher(token);
  if (next.trim().length < 4) throw new Error("새 비밀번호는 4자 이상이어야 해요.");
  const sql = await getSql();
  const rows = await sql<{ teacher_password_hash: string }>`
    select teacher_password_hash from settings where id = 1
  `;
  const hash = rows[0]?.teacher_password_hash;
  if (!hash || !(await verifySecret(current, hash))) {
    throw new Error("지금 비밀번호가 올바르지 않아요.");
  }
  const nextHash = await hashSecret(next.trim());
  await sql`
    update settings
    set teacher_password_hash = ${nextHash}, password_changed = true, updated_at = now()
    where id = 1
  `;
  return { ok: true as const };
}

export async function loginStudent(studentId: number, pin: string) {
  await ensureSeeded();
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen(`student-pin-${studentId}`);
  const sql = await getSql();
  const rows = await sql<{ id: number; pin_hash: string }>`
    select id, pin_hash from students where id = ${studentId}
  `;
  const row = rows[0];
  if (!row || !(await verifySecret(pin, row.pin_hash))) {
    await noteBioFail(`student-pin-${studentId}`, "비밀번호를");
    throw new Error("이름 또는 비밀번호가 올바르지 않아요.");
  }
  await noteBioOk(`student-pin-${studentId}`);
  return openStudentSession(row.id);
}

export async function loginStudentWithFace(studentId: number, descriptor: number[] | number[][]) {
  await ensureSeeded();
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen(`student-face-${studentId}`);
  const sql = await getSql();
  const rows = await sql<{ id: number }>`select id from students where id = ${studentId}`;
  if (!rows[0]) throw new Error("학생을 찾지 못했어요.");
  const { matchStudentFace } = await import("@/lib/server/student-bio.server");
  const ok = await matchStudentFace(studentId, descriptor);
  if (!ok) {
    await noteBioFail(`student-face-${studentId}`, "얼굴을");
    throw new Error("얼굴을 확인하지 못했어요. 타원에 맞추거나 비밀번호를 써 주세요.");
  }
  await noteBioOk(`student-face-${studentId}`);
  return openStudentSession(studentId);
}

export async function loginStudentWithFingerprint(studentId: number, response: unknown, origin?: string) {
  await ensureSeeded();
  const { assertBioOpen, noteBioFail, noteBioOk } = await import("@/lib/server/bio-lock.server");
  await assertBioOpen(`student-print-${studentId}`);
  const sql = await getSql();
  const rows = await sql<{ id: number }>`select id from students where id = ${studentId}`;
  if (!rows[0]) throw new Error("학생을 찾지 못했어요.");
  try {
    const { finishStudentPrintLogin } = await import("@/lib/server/student-bio.server");
    await finishStudentPrintLogin(studentId, response as never, origin);
  } catch {
    await noteBioFail(`student-print-${studentId}`, "지문을");
    throw new Error("지문을 확인하지 못했어요. 비밀번호를 써 주세요.");
  }
  await noteBioOk(`student-print-${studentId}`);
  return openStudentSession(studentId);
}

async function openStudentSession(studentId: number) {
  const token = await createSession("student", studentId);
  const { payDueSalary } = await import("@/lib/server/salary.server");
  await payDueSalary(studentId);
  const session = await loadSession(token);
  return { token, session };
}
