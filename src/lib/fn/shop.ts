import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { requireStudent } from "@/lib/server/session.server";
import { accrueTriggerTax } from "@/lib/server/tax.server";
import { num } from "@/lib/utils";
import type { Product, SnackOrder } from "@/lib/types";

const tokenSchema = z.object({ token: z.string().optional() });

export const listProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    name: string;
    price: unknown;
    description: string;
    is_active: boolean;
    sort_order: number;
  }>`
    select id, name, price, description, is_active, sort_order
    from products
    where is_active = true
    order by sort_order, id
  `;
  const products: Product[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: num(r.price),
    description: r.description,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  }));
  return products;
});

export const placeOrderFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        productId: z.number().int(),
        qty: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    const sql = await getSql();
    const products = await sql<{
      id: number;
      name: string;
      price: unknown;
      is_active: boolean;
    }>`
      select id, name, price, is_active from products where id = ${data.productId}
    `;
    const product = products[0];
    if (!product || !product.is_active) throw new Error("지금은 살 수 없는 간식이에요.");
    const unit = num(product.price);
    const total = unit * data.qty;
    const cashRows = await sql<{ cash: unknown }>`
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
    const tax = await accrueTriggerTax(session.student.id, "snack", total);
    return { ok: true as const, total, tax };
  });

export const myOrdersFn = createServerFn({ method: "GET" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      student_id: number;
      product_id: number;
      product_name: string;
      qty: number;
      unit_price: unknown;
      status: string;
      created_at: string;
    }>`
      select id, student_id, product_id, product_name, qty, unit_price, status,
             created_at::text as created_at
      from orders
      where student_id = ${session.student.id}
      order by id desc
      limit 30
    `;
    const orders: SnackOrder[] = rows.map((r) => ({
      id: r.id,
      studentId: r.student_id,
      studentName: session.student.name,
      productId: r.product_id,
      productName: r.product_name,
      qty: r.qty,
      unitPrice: num(r.unit_price),
      total: num(r.unit_price) * r.qty,
      status: r.status as SnackOrder["status"],
      createdAt: r.created_at,
    }));
    return orders;
  });
