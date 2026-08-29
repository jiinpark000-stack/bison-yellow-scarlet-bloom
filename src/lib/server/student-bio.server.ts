import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { getSql } from "@/lib/db";
import { bestGalleryScore, matchGallery, prepareGallery, parseStoredDescriptors } from "@/lib/face";
import { resolveWebAuthnEnv } from "@/lib/server/webauthn.server";

export type BioInfo = { id: number; label: string };

const MAX = 8;

function toB64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function fromB64url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64url"));
}

export async function listStudentFaces(studentId: number): Promise<BioInfo[]> {
  const sql = await getSql();
  return sql<BioInfo>`
    select id, label from student_faces where student_id = ${studentId} order by id
  `;
}

export async function addStudentFace(studentId: number, descriptor: number[] | number[][], label?: string) {
  const descriptors = prepareGallery(descriptor);
  if (descriptors.length === 0) throw new Error("얼굴을 다시 찍어 주세요.");
  const sql = await getSql();
  const count = await sql<{ n: number }>`
    select count(*)::int as n from student_faces where student_id = ${studentId}
  `;
  if ((count[0]?.n ?? 0) >= MAX) throw new Error("얼굴은 8개까지 등록할 수 있어요.");
  const name = label?.trim() || `얼굴 ${(count[0]?.n ?? 0) + 1}`;
  await sql`
    insert into student_faces (student_id, label, descriptor)
    values (${studentId}, ${name}, ${JSON.stringify(descriptors)})
  `;
  const { resetFaceLocks } = await import("@/lib/server/bio-lock.server");
  await resetFaceLocks();
  return { ok: true as const };
}

export async function removeStudentFace(studentId: number, id: number) {
  const sql = await getSql();
  const rows = await sql<{ id: number }>`
    delete from student_faces where id = ${id} and student_id = ${studentId} returning id
  `;
  if (!rows[0]) throw new Error("그 얼굴을 찾지 못했어요.");
  return { ok: true as const };
}

export async function matchStudentFace(studentId: number, descriptor: number[] | number[][]): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ descriptor: string }>`
    select descriptor from student_faces where student_id = ${studentId}
  `;
  if (rows.length === 0) throw new Error("먼저 얼굴을 등록해 주세요.");
  const gallery = rows.flatMap((row) => parseStoredDescriptors(row.descriptor));
  return matchGallery(gallery, descriptor);
}

export async function bestStudentFaceScore(descriptor: number[] | number[][]): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ descriptor: string }>`select descriptor from student_faces`;
  if (rows.length === 0) return 1;
  let best = 1;
  for (const row of rows) {
    best = Math.min(best, bestGalleryScore(parseStoredDescriptors(row.descriptor), descriptor));
  }
  return best;
}

export async function isStudentFingerprint(credId: string): Promise<boolean> {
  if (!credId) return false;
  const sql = await getSql();
  const rows = await sql<{ id: number }>`select id from student_webauthn where cred_id = ${credId} limit 1`;
  return Boolean(rows[0]);
}

export async function studentFaceCounts(): Promise<Map<number, number>> {
  const sql = await getSql();
  const rows = await sql<{ student_id: number; n: number }>`
    select student_id, count(*)::int as n from student_faces group by student_id
  `;
  return new Map(rows.map((r) => [r.student_id, r.n]));
}

export async function studentPrintCounts(): Promise<Map<number, number>> {
  const sql = await getSql();
  const rows = await sql<{ student_id: number; n: number }>`
    select student_id, count(*)::int as n from student_webauthn group by student_id
  `;
  return new Map(rows.map((r) => [r.student_id, r.n]));
}

export async function listStudentPrints(studentId: number): Promise<BioInfo[]> {
  const sql = await getSql();
  return sql<BioInfo>`
    select id, label from student_webauthn where student_id = ${studentId} order by id
  `;
}

type Challenge = { studentId: number; challenge: string; origin: string; rpID: string };

async function saveChallenge(value: Challenge) {
  const sql = await getSql();
  await sql`update settings set student_webauthn_challenge = ${JSON.stringify(value)}, updated_at = now() where id = 1`;
}

async function takeChallenge(studentId: number): Promise<Challenge> {
  const sql = await getSql();
  const rows = await sql<{ student_webauthn_challenge: string | null }>`
    select student_webauthn_challenge from settings where id = 1
  `;
  const raw = rows[0]?.student_webauthn_challenge;
  await sql`update settings set student_webauthn_challenge = null, updated_at = now() where id = 1`;
  if (!raw) throw new Error("지문 확인이 만료됐어요. 다시 눌러 주세요.");
  const parsed = JSON.parse(raw) as Challenge;
  if (!parsed?.challenge || parsed.studentId !== studentId) {
    throw new Error("지문 확인이 만료됐어요. 다시 눌러 주세요.");
  }
  return parsed;
}

export async function beginStudentPrintRegister(studentId: number, clientOrigin?: string) {
  const { rpID, origin } = resolveWebAuthnEnv(clientOrigin);
  const sql = await getSql();
  const existing = await sql<{ cred_id: string; transports: string | null }>`
    select cred_id, transports from student_webauthn where student_id = ${studentId}
  `;
  if (existing.length >= MAX) throw new Error("지문은 8개까지 등록할 수 있어요.");
  const student = await sql<{ name: string }>`select name from students where id = ${studentId}`;
  const options = await generateRegistrationOptions({
    rpName: "모이뱅크",
    rpID,
    userName: `student-${studentId}`,
    userDisplayName: student[0]?.name || "학생",
    attestationType: "none",
    timeout: 120_000,
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "preferred",
      residentKey: "preferred",
    },
    excludeCredentials: existing.map((c) => ({
      id: c.cred_id,
      transports: (c.transports ? JSON.parse(c.transports) : ["internal"]) as ["internal"],
    })),
  });
  await saveChallenge({ studentId, challenge: options.challenge, origin, rpID });
  return options;
}

export async function finishStudentPrintRegister(
  studentId: number,
  response: RegistrationResponseJSON,
  label?: string,
  clientOrigin?: string,
) {
  const stored = await takeChallenge(studentId);
  const env = clientOrigin ? resolveWebAuthnEnv(clientOrigin) : stored;
  const result = await verifyRegistrationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: [stored.origin, env.origin],
    expectedRPID: [stored.rpID, env.rpID],
    requireUserVerification: false,
  });
  if (!result.verified || !result.registrationInfo) {
    throw new Error("지문을 등록하지 못했어요. 다시 시도해 주세요.");
  }
  const cred = result.registrationInfo.credential;
  const sql = await getSql();
  const dup = await sql<{ id: number }>`select id from student_webauthn where cred_id = ${cred.id}`;
  if (dup[0]) throw new Error("이미 등록된 지문이에요.");
  const count = await sql<{ n: number }>`
    select count(*)::int as n from student_webauthn where student_id = ${studentId}
  `;
  if ((count[0]?.n ?? 0) >= MAX) throw new Error("지문은 8개까지 등록할 수 있어요.");
  const name = label?.trim() || `지문 ${(count[0]?.n ?? 0) + 1}`;
  await sql`
    insert into student_webauthn (student_id, cred_id, label, public_key, counter, transports)
    values (
      ${studentId},
      ${cred.id},
      ${name},
      ${toB64url(cred.publicKey)},
      ${cred.counter},
      ${JSON.stringify(cred.transports ?? ["internal"])}
    )
  `;
  return { ok: true as const };
}

export async function removeStudentPrint(studentId: number, id: number) {
  const sql = await getSql();
  const rows = await sql<{ id: number }>`
    delete from student_webauthn where id = ${id} and student_id = ${studentId} returning id
  `;
  if (!rows[0]) throw new Error("그 지문을 찾지 못했어요.");
  return { ok: true as const };
}

export async function beginStudentPrintLogin(studentId: number, clientOrigin?: string) {
  const { rpID, origin } = resolveWebAuthnEnv(clientOrigin);
  const sql = await getSql();
  const existing = await sql<{ cred_id: string; transports: string | null }>`
    select cred_id, transports from student_webauthn where student_id = ${studentId}
  `;
  if (existing.length === 0) throw new Error("먼저 지문을 등록해 주세요.");
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    timeout: 120_000,
    allowCredentials: existing.map((c) => ({
      id: c.cred_id,
      transports: (c.transports ? JSON.parse(c.transports) : ["internal"]) as ["internal"],
    })),
  });
  await saveChallenge({ studentId, challenge: options.challenge, origin, rpID });
  return options;
}

export async function finishStudentPrintLogin(
  studentId: number,
  response: AuthenticationResponseJSON,
  clientOrigin?: string,
) {
  const stored = await takeChallenge(studentId);
  if (stored.studentId !== studentId) throw new Error("지문이 이 통장과 맞지 않아요.");
  const env = clientOrigin ? resolveWebAuthnEnv(clientOrigin) : stored;
  const sql = await getSql();
  const credId = typeof response.id === "string" ? response.id : "";
  const rows = await sql<{
    id: number;
    cred_id: string;
    public_key: string;
    counter: number;
    transports: string | null;
  }>`
    select id, cred_id, public_key, counter, transports
    from student_webauthn
    where student_id = ${studentId} and cred_id = ${credId}
  `;
  const match = rows[0];
  if (!match) throw new Error("이 통장에 등록한 지문이 아니에요.");
  const result = await verifyAuthenticationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: [stored.origin, env.origin],
    expectedRPID: [stored.rpID, env.rpID],
    credential: {
      id: match.cred_id,
      publicKey: fromB64url(match.public_key) as Uint8Array<ArrayBuffer>,
      counter: match.counter,
      transports: (match.transports ? JSON.parse(match.transports) : ["internal"]) as ["internal"],
    },
    requireUserVerification: false,
  });
  if (!result.verified) throw new Error("지문이 맞지 않아요.");
  await sql`
    update student_webauthn set counter = ${result.authenticationInfo.newCounter} where id = ${match.id}
  `;
  return true;
}
