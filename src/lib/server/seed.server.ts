import { getSql } from "@/lib/db";
import { hashSecret } from "@/lib/server/crypto.server";
import { DEFAULT_TEACHER_PASSWORD } from "@/lib/types";

const globalRef = globalThis as typeof globalThis & {
  __moibankSeed__?: Promise<void>;
};

export function ensureSeeded(): Promise<void> {
  globalRef.__moibankSeed__ ??= seed().catch((err) => {
    globalRef.__moibankSeed__ = undefined;
    throw err;
  });
  return globalRef.__moibankSeed__;
}

async function seed() {
  const sql = await getSql();
  const existing = await sql<{ id: number }>`select id from settings where id = 1`;
  if (existing.length === 0) {
    const hash = await hashSecret(DEFAULT_TEACHER_PASSWORD);
    await sql`
      insert into settings (id, class_name, teacher_password_hash, password_changed)
      values (1, '6학년 5반', ${hash}, false)
    `;
  }

  const jobCount = await sql<{ n: number }>`select count(*)::int as n from jobs`;
  if ((jobCount[0]?.n ?? 0) === 0) {
    const jobs: [string, number, number][] = [
      ["학급회장", 700, 1],
      ["부회장", 560, 2],
      ["환경부장", 490, 3],
      ["체육부장", 490, 4],
      ["학습부장", 490, 5],
      ["급식도우미", 420, 6],
      ["칠판담당", 350, 7],
      ["학생", 280, 8],
    ];
    for (const [name, salary, sort] of jobs) {
      await sql`
        insert into jobs (name, salary, sort_order)
        values (${name}, ${salary}, ${sort})
      `;
    }
  }

  const productCount = await sql<{ n: number }>`select count(*)::int as n from products`;
  if ((productCount[0]?.n ?? 0) === 0) {
    const products: [string, number, string, number][] = [
      ["초코파이", 80, "달콤한 초코파이 1개", 1],
      ["새우깡", 70, "바삭한 새우깡 한 봉", 2],
      ["젤리", 50, "과일맛 젤리", 3],
      ["주스", 100, "과일 주스 한 잔", 4],
      ["초콜릿", 90, "우유 초콜릿", 5],
      ["아이스크림", 120, "학교 오는 날 받는 아이스크림", 6],
    ];
    for (const [name, price, description, sort] of products) {
      await sql`
        insert into products (name, price, description, sort_order)
        values (${name}, ${price}, ${description}, ${sort})
      `;
    }
  }
}
