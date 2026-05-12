import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function prevWeekKey(weekKey: string): string {
  const [yr, wk] = weekKey.split("-W").map(Number);
  if (wk === 1) return `${yr - 1}-W52`;
  return `${yr}-W${String(wk - 1).padStart(2, "0")}`;
}

function computeStreak(checkins: { weekKey: string }[]): number {
  if (!checkins.length) return 0;
  const sorted = [...checkins].sort((a, b) => b.weekKey.localeCompare(a.weekKey));
  const currentWeek = getWeekKey();
  const lastWeek = prevWeekKey(currentWeek);

  // Streak is alive if the user checked in this week OR last week (grace for current week)
  const mostRecent = sorted[0].weekKey;
  if (mostRecent !== currentWeek && mostRecent !== lastWeek) return 0;

  let streak = 0;
  let expected = mostRecent;
  for (const c of sorted) {
    if (c.weekKey === expected) {
      streak++;
      expected = prevWeekKey(expected);
    } else {
      break;
    }
  }
  return streak;
}

const checkinSchema = z.object({
  financialMood: z.number().int().min(1).max(10),
  burnoutMood: z.number().int().min(1).max(10),
  relationshipMood: z.number().int().min(1).max(10),
  decisionMood: z.number().int().min(1).max(10),
  timeMood: z.number().int().min(1).max(10),
  note: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const checkins = await prisma.weeklyCheckin.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 52,
  });

  const currentWeekKey = getWeekKey();
  const thisWeek = checkins.find((c) => c.weekKey === currentWeekKey) ?? null;
  const streak = computeStreak(checkins);

  return NextResponse.json({ success: true, streak, thisWeek, history: checkins });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });
  }

  const weekKey = getWeekKey();
  const checkin = await prisma.weeklyCheckin.upsert({
    where: { userId_weekKey: { userId: session.userId, weekKey } },
    create: { userId: session.userId, weekKey, ...parsed.data },
    update: { ...parsed.data },
  });

  const allCheckins = await prisma.weeklyCheckin.findMany({
    where: { userId: session.userId },
    select: { weekKey: true },
  });
  const streak = computeStreak(allCheckins);

  return NextResponse.json({ success: true, checkin, streak });
}
