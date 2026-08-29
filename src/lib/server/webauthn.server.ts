import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";

type StoredCred = {
  id: string;
  label: string;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
};

type Challenge = { challenge: string; origin: string; rpID: string };

function toB64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function fromB64url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64url"));
}

function isIpHost(host: string) {
  return host === "127.0.0.1" || host === "[::1]" || /^\d+\.\d+\.\d+\.\d+$/.test(host);
}

function hostAllowed(host: string) {
  const h = host.toLowerCase();
  if (h === "localhost" || isIpHost(h)) return true;
  if (h === "grok.com" || h.endsWith(".grok.com")) return true;
  if (h === "grok.me" || h.endsWith(".grok.me")) return true;
  if (h === "grok-sandbox.com" || h.endsWith(".grok-sandbox.com")) return true;
  return h.includes(".");
}

function originFromHeaders() {
  const req = getRequest();
  if (!req) throw new Error("요청을 확인할 수 없어요.");
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
    .split(",")[0]
    .trim();
  const hostname = host.split(":")[0];
  const proto = (req.headers.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", ""))
    .split(",")[0]
    .trim();
  return { host, hostname, proto, origin: `${proto}://${host}` };
}

export function resolveWebAuthnEnv(clientOrigin?: string): { origin: string; rpID: string } {
  let origin = "";
  let hostname = "";
  if (clientOrigin) {
    const url = new URL(clientOrigin);
    hostname = url.hostname;
    origin = url.origin;
    if (url.protocol !== "https:" && hostname !== "localhost" && !isIpHost(hostname)) {
      throw new Error("안전한 주소에서만 지문을 쓸 수 있어요.");
    }
  } else {
    const header = originFromHeaders();
    origin = header.origin;
    hostname = header.hostname;
  }
  if (!hostname || !hostAllowed(hostname)) {
    throw new Error("이 주소에서는 지문을 쓸 수 없어요.");
  }
  if (isIpHost(hostname)) {
    const header = originFromHeaders();
    if (header.hostname && !isIpHost(header.hostname) && hostAllowed(header.hostname)) {
      return { origin: header.origin, rpID: header.hostname };
    }
    throw new Error("이 미리보기에서는 지문이 막혀 있어요. 게시한 주소나 휴대폰 브라우저에서 등록해 주세요.");
  }
  return { origin, rpID: hostname };
}

function asCreds(raw: string | null): StoredCred[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "publicKey" in parsed) {
    const one = parsed as StoredCred;
    return [{ ...one, label: one.label || "지문 1" }];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is StoredCred => {
      return Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as StoredCred).id === "string" &&
          typeof (item as StoredCred).publicKey === "string",
      );
    })
    .map((item, i) => ({ ...item, label: item.label || `지문 ${i + 1}` }));
}

async function readCreds(): Promise<StoredCred[]> {
  const sql = await getSql();
  const rows = await sql<{ webauthn_cred: string | null }>`select webauthn_cred from settings where id = 1`;
  return asCreds(rows[0]?.webauthn_cred ?? null);
}

async function writeCreds(creds: StoredCred[]) {
  const sql = await getSql();
  await sql`
    update settings set webauthn_cred = ${JSON.stringify(creds)}, updated_at = now() where id = 1
  `;
}

async function saveChallenge(value: Challenge) {
  const sql = await getSql();
  await sql`update settings set webauthn_challenge = ${JSON.stringify(value)}, updated_at = now() where id = 1`;
}

async function takeChallenge(): Promise<Challenge> {
  const sql = await getSql();
  const rows = await sql<{ webauthn_challenge: string | null }>`
    select webauthn_challenge from settings where id = 1
  `;
  const raw = rows[0]?.webauthn_challenge;
  await sql`update settings set webauthn_challenge = null, updated_at = now() where id = 1`;
  if (!raw) throw new Error("지문 확인이 만료됐어요. 다시 눌러 주세요.");
  try {
    const parsed = JSON.parse(raw) as Challenge;
    if (parsed?.challenge && parsed.origin && parsed.rpID) return parsed;
  } catch {
    /* old string challenge */
  }
  const env = resolveWebAuthnEnv();
  return { challenge: raw, origin: env.origin, rpID: env.rpID };
}

export type PrintInfo = { id: string; label: string };

export async function hasFingerprint(): Promise<boolean> {
  return (await readCreds()).length > 0;
}

export async function listFingerprints(): Promise<PrintInfo[]> {
  return (await readCreds()).map(({ id, label }) => ({ id, label }));
}

export async function beginFingerprintRegister(clientOrigin?: string) {
  const { rpID, origin } = resolveWebAuthnEnv(clientOrigin);
  const existing = await readCreds();
  if (existing.length >= 8) throw new Error("지문은 8개까지 등록할 수 있어요.");
  const options = await generateRegistrationOptions({
    rpName: "모이뱅크",
    rpID,
    userName: "teacher",
    userDisplayName: "선생님",
    attestationType: "none",
    timeout: 120_000,
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "preferred",
      residentKey: "preferred",
    },
    excludeCredentials: existing.map((c) => ({ id: c.id, transports: c.transports ?? ["internal"] })),
  });
  await saveChallenge({ challenge: options.challenge, origin, rpID });
  return options;
}

export async function finishFingerprintRegister(
  response: RegistrationResponseJSON,
  label?: string,
  clientOrigin?: string,
) {
  const stored = await takeChallenge();
  const env = clientOrigin ? resolveWebAuthnEnv(clientOrigin) : stored;
  const result = await verifyRegistrationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: [stored.origin, env.origin],
    expectedRPID: [stored.rpID, env.rpID],
    requireUserVerification: true,
  });
  if (!result.verified || !result.registrationInfo) {
    throw new Error("지문을 등록하지 못했어요. 다시 시도해 주세요.");
  }
  const cred = result.registrationInfo.credential;
  const existing = await readCreds();
  if (existing.some((c) => c.id === cred.id)) throw new Error("이미 등록된 지문이에요.");
  if (existing.length >= 8) throw new Error("지문은 8개까지 등록할 수 있어요.");
  existing.push({
    id: cred.id,
    label: label?.trim() || `지문 ${existing.length + 1}`,
    publicKey: toB64url(cred.publicKey),
    counter: cred.counter,
    transports: cred.transports ?? ["internal"],
  });
  await writeCreds(existing);
  return { ok: true as const, count: existing.length };
}

export async function removeFingerprint(id: string) {
  const existing = await readCreds();
  const next = existing.filter((c) => c.id !== id);
  if (next.length === existing.length) throw new Error("그 지문을 찾지 못했어요.");
  await writeCreds(next);
  return { ok: true as const, count: next.length };
}

export async function beginFingerprintLogin(clientOrigin?: string) {
  const { rpID, origin } = resolveWebAuthnEnv(clientOrigin);
  const existing = await readCreds();
  if (existing.length === 0) throw new Error("먼저 설정에서 지문을 등록해 주세요.");
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    timeout: 120_000,
    allowCredentials: existing.map((c) => ({ id: c.id, transports: c.transports ?? ["internal"] })),
  });
  await saveChallenge({ challenge: options.challenge, origin, rpID });
  return options;
}

export async function finishFingerprintLogin(
  response: AuthenticationResponseJSON,
  clientOrigin?: string,
): Promise<boolean> {
  const stored = await takeChallenge();
  const env = clientOrigin ? resolveWebAuthnEnv(clientOrigin) : stored;
  const existing = await readCreds();
  if (existing.length === 0) throw new Error("먼저 설정에서 지문을 등록해 주세요.");
  const credId = typeof response.id === "string" ? response.id : "";
  const match = existing.find((c) => c.id === credId);
  if (!match) throw new Error("등록한 지문이 아니에요. 이 기기에서 다시 등록해 주세요.");
  const result = await verifyAuthenticationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: [stored.origin, env.origin],
    expectedRPID: [stored.rpID, env.rpID],
    credential: {
      id: match.id,
      publicKey: fromB64url(match.publicKey) as Uint8Array<ArrayBuffer>,
      counter: match.counter,
      transports: match.transports ?? ["internal"],
    },
    requireUserVerification: true,
  });
  if (!result.verified) throw new Error("지문이 맞지 않아요. 다시 시도해 주세요.");
  const next = existing.map((c) =>
    c.id === match.id ? { ...c, counter: result.authenticationInfo.newCounter } : c,
  );
  await writeCreds(next);
  return true;
}
