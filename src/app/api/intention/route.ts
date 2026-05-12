import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeIntentionStreak(intentions: { dateKey: string }[]): number {
  if (!intentions.length) return 0;
  const sorted = [...intentions].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const today = getTodayKey();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const mostRecent = sorted[0].dateKey;
  if (mostRecent !== today && mostRecent !== yesterday) return 0;

  let streak = 0;
  const cur = new Date(mostRecent);
  for (const item of sorted) {
    const expected = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    if (item.dateKey === expected) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

const createSchema = z.object({
  intention: z.string().min(1).max(1000),
  acceptanceFocus: z.string().min(1).max(1000),
  virtue: z.enum(["wisdom", "courage", "justice", "temperance"]),
});

const updateSchema = z.object({
  completed: z.boolean().optional(),
  completedNote: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const intentions = await prisma.morningIntention.findMany({
    where: { userId: session.userId },
    orderBy: { dateKey: "desc" },
    take: 30,
  });

  const todayKey = getTodayKey();
  const today = intentions.find((i) => i.dateKey === todayKey) ?? null;
  const streak = computeIntentionStreak(intentions);

  return NextResponse.json({ success: true, today, streak, history: intentions });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();

  // Check if it's a create or an update (complete evening reflection)
  const updateParsed = updateSchema.safeParse(body);
  if (body.completed !== undefined || body.completedNote !== undefined) {
    if (!updateParsed.success) {
      return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });
    }
    const todayKey = getTodayKey();
    const existing = await prisma.morningIntention.findFirst({
      where: { userId: session.userId, dateKey: todayKey },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "No intention set for today." }, { status: 404 });
    }
    const updated = await prisma.morningIntention.update({
      where: { id: existing.id },
      data: updateParsed.data,
    });
    return NextResponse.json({ success: true, intention: updated });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });
  }

  const todayKey = getTodayKey();
  const intention = await prisma.morningIntention.upsert({
    where: { userId_dateKey: { userId: session.userId, dateKey: todayKey } },
    create: { userId: session.userId, dateKey: todayKey, ...parsed.data },
    update: { ...parsed.data },
  });

  const allKeys = await prisma.morningIntention.findMany({
    where: { userId: session.userId },
    select: { dateKey: true },
  });
  const streak = computeIntentionStreak(allKeys);

  return NextResponse.json({ success: true, intention, streak });
}
