import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import {
  cancelEventJoin,
  joinAllStudents,
  joinEvent,
  listStudentEvents,
  payEventRewards,
} from "@/lib/server/events.server";
import { requireStudent, requireTeacher, requireVaultOpen } from "@/lib/server/session.server";

const tokenSchema = z.object({ token: z.string().optional() });

export const upsertEventFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        id: z.number().int().optional(),
        name: z.string().min(1).max(30),
        description: z.string().max(120).optional(),
        fee: z.number().min(0).max(100_000),
        reward: z.number().min(0).max(100_000),
        eventOn: z.string().optional(),
        openNow: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    const name = data.name.trim();
    const description = (data.description ?? "").trim();
    const eventOn = data.eventOn && /^\d{4}-\d{2}-\d{2}$/.test(data.eventOn) ? data.eventOn : null;
    const status = data.openNow ? "open" : "draft";
    if (data.id) {
      await sql`
        update events
        set name = ${name},
            description = ${description},
            fee = ${data.fee},
            reward = ${data.reward},
            event_on = ${eventOn}
        where id = ${data.id}
      `;
      return { ok: true as const, id: data.id };
    }
    const inserted = await sql<{ id: number }>`
      insert into events (name, description, fee, reward, status, event_on)
      values (${name}, ${description}, ${data.fee}, ${data.reward}, ${status}, ${eventOn})
      returning id
    `;
    return { ok: true as const, id: inserted[0]?.id ?? 0 };
  });

export const setEventStatusFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        id: z.number().int(),
        status: z.enum(["draft", "open", "closed"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`update events set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

export const deleteEventFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), id: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`delete from events where id = ${data.id}`;
    return { ok: true as const };
  });

export const teacherJoinEventFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ token: z.string().optional(), eventId: z.number().int(), studentId: z.number().int() }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    return joinEvent(data.studentId, data.eventId);
  });

export const teacherCancelEventFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ token: z.string().optional(), eventId: z.number().int(), studentId: z.number().int() }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    return cancelEventJoin(data.studentId, data.eventId);
  });

export const teacherJoinAllFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), eventId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    return joinAllStudents(data.eventId);
  });

export const payEventRewardsFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), eventId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireVaultOpen(data.token);
    return payEventRewards(data.eventId);
  });

export const studentEventsFn = createServerFn({ method: "GET" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    return listStudentEvents(session.student.id);
  });

export const joinEventFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), eventId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    return joinEvent(session.student.id, data.eventId);
  });

export const cancelJoinFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), eventId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    return cancelEventJoin(session.student.id, data.eventId);
  });
