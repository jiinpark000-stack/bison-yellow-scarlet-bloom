import { t as createServerFn } from "./ssr.mjs";
import { u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql, p as requireStudent, r as createServerRpc } from "./session.server-C3UH2SEm.mjs";
import { a as number, o as object, s as string } from "../_libs/zod.mjs";
import { t as accrueTriggerTax } from "./tax.server-Z8B_vN0K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-BbQLbH6G.js
var tokenSchema = object({ token: string().optional() });
var listProductsFn_createServerFn_handler = createServerRpc({
	id: "3ab8519786d35c2c29539a7223612046d4fe469217196b612a8108d5c8a985b9",
	name: "listProductsFn",
	filename: "src/lib/fn/shop.ts"
}, (opts) => listProductsFn.__executeServer(opts));
var listProductsFn = createServerFn({ method: "GET" }).handler(listProductsFn_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, name, price, description, is_active, sort_order
    from products
    where is_active = true
    order by sort_order, id
  `).map((r) => ({
		id: r.id,
		name: r.name,
		price: num(r.price),
		description: r.description,
		isActive: r.is_active,
		sortOrder: r.sort_order
	}));
});
var placeOrderFn_createServerFn_handler = createServerRpc({
	id: "636738a2a5accc8fbe2590fe8622a30fdf000b0e32bf12c57031b4ba5d4dcc36",
	name: "placeOrderFn",
	filename: "src/lib/fn/shop.ts"
}, (opts) => placeOrderFn.__executeServer(opts));
var placeOrderFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	productId: number().int(),
	qty: number().int().positive()
}).parse(d)).handler(placeOrderFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	const sql = await getSql();
	const product = (await sql`
      select id, name, price, is_active from products where id = ${data.productId}
    `)[0];
	if (!product || !product.is_active) throw new Error("지금은 살 수 없는 간식이에요.");
	const unit = num(product.price);
	const total = unit * data.qty;
	const cashRows = await sql`
      select cash from students where id = ${session.student.id}
    `;
	if (num(cashRows[0]?.cash) < total) throw new Error("잔액이 부족해요.");
	await sql`
      update students set cash = cash - ${total} where id = ${session.student.id}
    `;
	await sql`
      insert into orders (student_id, product_id, product_name, qty, unit_price, status)
      values (${session.student.id}, ${product.id}, ${product.name}, ${data.qty}, ${unit}, 'waiting')
    `;
	await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (
        ${session.student.id},
        'snack',
        ${-total},
        ${`${product.name} ${data.qty}개 주문 · 학교에서 받기`}
      )
    `;
	return {
		ok: true,
		total,
		tax: await accrueTriggerTax(session.student.id, "snack", total)
	};
});
var myOrdersFn_createServerFn_handler = createServerRpc({
	id: "beb0263a05bc8cd2584c83f2a40411d8904e26146781ad37e58698f34daffa25",
	name: "myOrdersFn",
	filename: "src/lib/fn/shop.ts"
}, (opts) => myOrdersFn.__executeServer(opts));
var myOrdersFn = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(myOrdersFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return (await (await getSql())`
      select id, student_id, product_id, product_name, qty, unit_price, status,
             created_at::text as created_at
      from orders
      where student_id = ${session.student.id}
      order by id desc
      limit 30
    `).map((r) => ({
		id: r.id,
		studentId: r.student_id,
		studentName: session.student.name,
		productId: r.product_id,
		productName: r.product_name,
		qty: r.qty,
		unitPrice: num(r.unit_price),
		total: num(r.unit_price) * r.qty,
		status: r.status,
		createdAt: r.created_at
	}));
});
//#endregion
export { listProductsFn_createServerFn_handler, myOrdersFn_createServerFn_handler, placeOrderFn_createServerFn_handler };
