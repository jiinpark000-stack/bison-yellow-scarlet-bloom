import { r as __exportAll } from "../_runtime.mjs";
import { s as formatWon, u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql, t as __exportAll$1 } from "./session.server-C3UH2SEm.mjs";
import { i as parseDescriptor, r as faceDistance, t as FACE_MATCH_MAX } from "./face-v4_U7c_1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vault.server-BhJ7xgqC.js
var vault_server_BhJ7xgqC_exports = /* @__PURE__ */ __exportAll({
	a: () => vault_server_exports,
	i: () => listVaultLedger,
	n: () => debitVault,
	r: () => hasVaultFace,
	t: () => creditVault
});
var vault_server_exports = /* @__PURE__ */ __exportAll$1({
	creditVault: () => creditVault,
	debitVault: () => debitVault,
	hasVaultFace: () => hasVaultFace,
	listVaultLedger: () => listVaultLedger,
	matchVaultFace: () => matchVaultFace,
	saveVaultFace: () => saveVaultFace
});
async function creditVault(amount, kind, memo) {
	const amt = Math.round(amount);
	if (!Number.isFinite(amt) || amt <= 0) return;
	const sql = await getSql();
	await sql`update settings set tax_vault = tax_vault + ${amt}, updated_at = now() where id = 1`;
	await sql`
    insert into vault_ledger (kind, amount, memo)
    values (${kind}, ${amt}, ${memo})
  `;
}
async function debitVault(amount, kind, memo) {
	const amt = Math.round(amount);
	if (!Number.isFinite(amt) || amt <= 0) return;
	const sql = await getSql();
	const rows = await sql`select tax_vault from settings where id = 1`;
	const vault = num(rows[0]?.tax_vault);
	if (vault < amt) throw new Error(`학급 창고가 ${formatWon(amt)} 필요해요. 지금 ${formatWon(vault)} 있어요.`);
	await sql`update settings set tax_vault = tax_vault - ${amt}, updated_at = now() where id = 1`;
	await sql`
    insert into vault_ledger (kind, amount, memo)
    values (${kind}, ${-amt}, ${memo})
  `;
}
async function listVaultLedger(limit = 30) {
	return (await (await getSql())`
    select id, kind, amount, memo, created_at::text as created_at
    from vault_ledger
    order by id desc
    limit ${limit}
  `).map((r) => ({
		id: r.id,
		kind: r.kind,
		amount: num(r.amount),
		memo: r.memo,
		createdAt: r.created_at
	}));
}
async function hasVaultFace() {
	const rows = await (await getSql())`select vault_face as n from settings where id = 1`;
	return Boolean(rows[0]?.n);
}
async function saveVaultFace(descriptor) {
	const parsed = parseDescriptor(descriptor);
	if (!parsed) throw new Error("얼굴을 다시 찍어 주세요.");
	await (await getSql())`
    update settings set vault_face = ${JSON.stringify(parsed)}, updated_at = now() where id = 1
  `;
}
async function matchVaultFace(descriptor) {
	const incoming = parseDescriptor(descriptor);
	if (!incoming) return false;
	let stored = (await (await getSql())`select vault_face from settings where id = 1`)[0]?.vault_face ?? null;
	if (typeof stored === "string") try {
		stored = JSON.parse(stored);
	} catch {
		stored = null;
	}
	const registered = parseDescriptor(stored);
	if (!registered) throw new Error("먼저 선생님 얼굴을 등록해 주세요.");
	return faceDistance(registered, incoming) <= FACE_MATCH_MAX;
}
//#endregion
export { vault_server_BhJ7xgqC_exports as a, listVaultLedger as i, debitVault as n, hasVaultFace as r, creditVault as t };
