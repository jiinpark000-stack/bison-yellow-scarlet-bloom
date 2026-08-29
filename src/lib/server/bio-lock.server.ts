import { getSql } from "@/lib/db";

type LockRow = { fails: number; until: number };
type LockMap = Record<string, LockRow>;

const mem = (globalThis as typeof globalThis & { __bioLock__?: LockMap }).__bioLock__ ??
  ((globalThis as typeof globalThis & { __bioLock__?: LockMap }).__bioLock__ = {});

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readAll(): Promise<LockMap> {
  try {
    const sql = await getSql();
    const rows = await sql<{ bio_lock: string | null }>`select bio_lock from settings where id = 1`;
    const parsed = rows[0]?.bio_lock ? (JSON.parse(rows[0].bio_lock) as LockMap) : {};
    return { ...mem, ...parsed };
  } catch {
    return { ...mem };
  }
}

async function writeAll(map: LockMap) {
  Object.assign(mem, map);
  try {
    const sql = await getSql();
    await sql`update settings set bio_lock = ${JSON.stringify(map)}, updated_at = now() where id = 1`;
  } catch {
    /* memory fallback */
  }
}

export async function assertBioOpen(key: string) {
  const all = await readAll();
  const row = all[key];
  if (row?.until && row.until > Date.now()) {
    const min = Math.max(1, Math.ceil((row.until - Date.now()) / 60000));
    throw new Error(`여러 번 틀렸어요. 비밀번호로 열거나 ${min}분 뒤에 다시 시도해 주세요.`);
  }
}

export async function resetFaceLocks() {
  const all = await readAll();
  const keys = Object.keys(all).filter((key) => key.includes("face"));
  if (keys.length === 0) return;
  for (const key of keys) delete all[key];
  await writeAll(all);
}

export async function noteBioOk(key: string) {
  const all = await readAll();
  if (!all[key]) return;
  delete all[key];
  await writeAll(all);
}

export async function noteBioFail(key: string, label = "얼굴을") {
  await wait(320);
  const all = await readAll();
  const prev = all[key] && all[key].until < Date.now() ? { fails: 0, until: 0 } : all[key] ?? { fails: 0, until: 0 };
  const fails = prev.fails + 1;
  if (fails >= 8) {
    all[key] = { fails: 0, until: Date.now() + 60 * 1000 };
    await writeAll(all);
    throw new Error(`${label} 여러 번 틀렸어요. 비밀번호로 열거나 1분 뒤에 다시 시도해 주세요.`);
  }
  all[key] = { fails, until: 0 };
  await writeAll(all);
}
