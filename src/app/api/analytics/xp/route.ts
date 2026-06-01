import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/** Returns Monday 00:00 and Sunday 23:59:59 of the current week + offset weeks */
function weekBounds(offsetWeeks = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

const XP = {
  pulse: 10,
  calculator: 25,
  journal: 20,
  checkin: 50,  // capped at 1 per week
  intention: 10,
  reflection: 30,
};

async function computeXP(userId: string, start: Date, end: Date) {
  const [pulses, calcs, journals, checkins, intentions, reflections] = await Promise.all([
    prisma.dailyPulse.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
    prisma.calculatorResult.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
    prisma.decisionJournal.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
    prisma.weeklyCheckin.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
    prisma.morningIntention.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
    prisma.aiReflection.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
  ]);

  const total =
    pulses * XP.pulse +
    calcs * XP.calculator +
    journals * XP.journal +
    Math.min(checkins, 1) * XP.checkin +
    intentions * XP.intention +
    reflections * XP.reflection;

  return { total, breakdown: { pulses, calcs, journals, checkins: Math.min(checkins, 1), intentions, reflections } };
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const { start: thisStart, end: thisEnd } = weekBounds(0);
  const { start: lastStart, end: lastEnd } = weekBounds(-1);

  const [thisWeek, lastWeek] = await Promise.all([
    computeXP(session.userId, thisStart, thisEnd),
    computeXP(session.userId, lastStart, lastEnd),
  ]);

  return NextResponse.json({ success: true, thisWeek, lastWeek, xpValues: XP });
}
