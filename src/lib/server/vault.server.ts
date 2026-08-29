import { getSql } from "@/lib/db";
import { bestGalleryScore, matchGallery, prepareGallery, parseDescriptor, parseStoredDescriptors } from "@/lib/face";
import { formatWon, num } from "@/lib/utils";

export type VaultEntry = {
  id: number;
  kind: string;
  amount: number;
  memo: string;
  createdAt: string;
};

export async function creditVault(amount: number, kind: string, memo: string) {
  const amt = Math.round(amount);
  if (!Number.isFinite(amt) || amt <= 0) return;
  const sql = await getSql();
  await sql`update settings set tax_vault = tax_vault + ${amt}, updated_at = now() where id = 1`;
  await sql`
    insert into vault_ledger (kind, amount, memo)
    values (${kind}, ${amt}, ${memo})
  `;
}

export async function debitVault(amount: number, kind: string, memo: string) {
  const amt = Math.round(amount);
  if (!Number.isFinite(amt) || amt <= 0) return;
  const sql = await getSql();
  const rows = await sql<{ tax_vault: unknown }>`select tax_vault from settings where id = 1`;
  const vault = num(rows[0]?.tax_vault);
  if (vault < amt) {
    throw new Error(`학급 창고가 ${formatWon(amt)} 필요해요. 지금 ${formatWon(vault)} 있어요.`);
  }
  await sql`update settings set tax_vault = tax_vault - ${amt}, updated_at = now() where id = 1`;
  await sql`
    insert into vault_ledger (kind, amount, memo)
    values (${kind}, ${-amt}, ${memo})
  `;
}

export async function listVaultLedger(limit = 30): Promise<VaultEntry[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    kind: string;
    amount: unknown;
    memo: string;
    created_at: string;
  }>`
    select id, kind, amount, memo, created_at::text as created_at
    from vault_ledger
    order by id desc
    limit ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    amount: num(r.amount),
    memo: r.memo,
    createdAt: r.created_at,
  }));
}

export async function hasVaultFace(): Promise<boolean> {
  return (await listFaces()).length > 0;
}

export type FaceInfo = { id: string; label: string };

type StoredFace = FaceInfo & { descriptors: number[][] };

function asFaces(raw: string | null): StoredFace[] {
  if (!raw) return [];
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "number") {
    const descriptor = parseDescriptor(parsed);
    return descriptor ? [{ id: "legacy", label: "얼굴 1", descriptors: [descriptor] }] : [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: StoredFace[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const row = item as { id?: unknown; label?: unknown; descriptor?: unknown; descriptors?: unknown };
    const descriptors = parseStoredDescriptors(row.descriptors ?? row.descriptor);
    if (descriptors.length === 0) continue;
    out.push({
      id: typeof row.id === "string" && row.id ? row.id : `face-${out.length + 1}`,
      label: typeof row.label === "string" && row.label.trim() ? row.label.trim() : `얼굴 ${out.length + 1}`,
      descriptors,
    });
  }
  return out;
}

async function readFaces(): Promise<StoredFace[]> {
  const sql = await getSql();
  const rows = await sql<{ vault_face: string | null }>`select vault_face from settings where id = 1`;
  return asFaces(rows[0]?.vault_face ?? null);
}

async function writeFaces(faces: StoredFace[]) {
  const sql = await getSql();
  await sql`
    update settings set vault_face = ${JSON.stringify(faces)}, updated_at = now() where id = 1
  `;
}

export async function listFaces(): Promise<FaceInfo[]> {
  return (await readFaces()).map(({ id, label }) => ({ id, label }));
}

export async function addVaultFace(descriptor: number[] | number[][], label?: string) {
  const descriptors = prepareGallery(descriptor);
  if (descriptors.length === 0) throw new Error("얼굴을 다시 찍어 주세요.");
  const faces = await readFaces();
  if (faces.length >= 8) throw new Error("얼굴은 8개까지 등록할 수 있어요.");
  const name = label?.trim() || `얼굴 ${faces.length + 1}`;
  faces.push({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    label: name,
    descriptors,
  });
  await writeFaces(faces);
  const { resetFaceLocks } = await import("@/lib/server/bio-lock.server");
  await resetFaceLocks();
  return { ok: true as const, count: faces.length };
}

export async function removeVaultFace(id: string) {
  const faces = await readFaces();
  const next = faces.filter((f) => f.id !== id);
  if (next.length === faces.length) throw new Error("그 얼굴을 찾지 못했어요.");
  await writeFaces(next);
  return { ok: true as const, count: next.length };
}

export async function teacherFaceScore(descriptor: number[] | number[][]): Promise<number> {
  const faces = await readFaces();
  return bestGalleryScore(faces.flatMap((face) => face.descriptors), descriptor);
}

export async function matchVaultFace(descriptor: number[] | number[][]): Promise<boolean> {
  const faces = await readFaces();
  if (faces.length === 0) throw new Error("먼저 선생님 얼굴을 등록해 주세요.");
  const gallery = faces.flatMap((face) => face.descriptors);
  return matchGallery(gallery, descriptor);
}
