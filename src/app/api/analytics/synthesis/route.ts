import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { computeDailyStreak, computeCompositeScore, getDateKey } from "@/lib/pulse";

function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function prevWeekKey(wk: string): string {
  const [yr, w] = wk.split("-W").map(Number);
  return w === 1 ? `${yr - 1}-W52` : `${yr}-W${String(w - 1).padStart(2, "0")}`;
}

function computeWeeklyStreak(checkins: { weekKey: string }[]): number {
  if (!checkins.length) return 0;
  const sorted = [...checkins].sort((a, b) => b.weekKey.localeCompare(a.weekKey));
  const current = getWeekKey();
  const last = prevWeekKey(current);
  const mostRecent = sorted[0].weekKey;
  if (mostRecent !== current && mostRecent !== last) return 0;
  let streak = 0;
  let expected = mostRecent;
  for (const c of sorted) {
    if (c.weekKey === expected) { streak++; expected = prevWeekKey(expected); }
    else break;
  }
  return streak;
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const cutoff30 = new Date(Date.now() - 30 * 86400000);
    const cutoff90 = new Date(Date.now() - 90 * 86400000);

    const [pulses, checkins, calcResults, virtueRatings, intentions, achievementCount] =
      await Promise.all([
        prisma.dailyPulse.findMany({
          where: { userId: session.userId, createdAt: { gte: cutoff30 } },
          orderBy: { date: "asc" },
          select: { id: true, date: true, energy: true, calm: true, clarity: true, gratitude: true, connection: true, note: true, createdAt: true, updatedAt: true, userId: true },
        }),
        prisma.weeklyCheckin.findMany({
          where: { userId: session.userId },
          select: { weekKey: true },
        }),
        prisma.calculatorResult.findMany({
          where: { userId: session.userId },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { type: true, score: true, createdAt: true },
        }),
        prisma.virtueRating.findMany({
          where: { userId: session.userId },
          orderBy: { weekKey: "desc" },
          take: 8,
          select: { weekKey: true, wisdom: true, courage: true, justice: true, temperance: true, createdAt: true },
        }),
        prisma.morningIntention.findMany({
          where: { userId: session.userId, createdAt: { gte: cutoff90 } },
          select: { completed: true },
        }),
        prisma.achievement.count({ where: { userId: session.userId } }),
      ]);

    // ── Latest calculator score per type ─────────────────────────────
    const latestCalcScores: Record<string, number> = {};
    for (const r of calcResults) {
      if (latestCalcScores[r.type] === undefined) latestCalcScores[r.type] = r.score;
    }

    // ── Pulse history with composite ──────────────────────────────────
    const pulseHistory = pulses.map((p) => ({
      ...p,
      composite: computeCompositeScore(p),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    // ── Pulse averages (last 7 days) ──────────────────────────────────
    const last7Pulses = pulseHistory.slice(-7);
    const pulseAvgs = last7Pulses.length > 0
      ? {
          energy:     Math.round(last7Pulses.reduce((s, p) => s + p.energy, 0) / last7Pulses.length * 10) / 10,
          calm:       Math.round(last7Pulses.reduce((s, p) => s + p.calm, 0) / last7Pulses.length * 10) / 10,
          clarity:    Math.round(last7Pulses.reduce((s, p) => s + p.clarity, 0) / last7Pulses.length * 10) / 10,
          gratitude:  Math.round(last7Pulses.reduce((s, p) => s + p.gratitude, 0) / last7Pulses.length * 10) / 10,
          connection: Math.round(last7Pulses.reduce((s, p) => s + p.connection, 0) / last7Pulses.length * 10) / 10,
          composite:  Math.round(last7Pulses.reduce((s, p) => s + p.composite, 0) / last7Pulses.length),
        }
      : null;

    // ── Streaks ───────────────────────────────────────────────────────
    const allPulseDates = await prisma.dailyPulse.findMany({
      where: { userId: session.userId },
      select: { date: true },
    });
    const dailyStreak = computeDailyStreak(allPulseDates);
    const weeklyStreak = computeWeeklyStreak(checkins);

    // ── Virtue stats ──────────────────────────────────────────────────
    const latestVirtues = virtueRatings[0] ?? null;
    const virtueHistory = virtueRatings.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      avg: Math.round(((v.wisdom + v.courage + v.justice + v.temperance) / 4) * 10) / 10,
    }));

    // ── Morning intention stats ───────────────────────────────────────
    const intentionStats = {
      total: intentions.length,
      completed: intentions.filter((i) => i.completed).length,
      rate: intentions.length > 0
        ? Math.round((intentions.filter((i) => i.completed).length / intentions.length) * 100)
        : 0,
    };

    // ── Today's pulse key ─────────────────────────────────────────────
    const today = getDateKey();
    const todayPulse = pulseHistory.find((p) => p.date === today) ?? null;

    // ── Life Momentum Score (0–100) ───────────────────────────────────
    const calcValues = Object.values(latestCalcScores);
    const calcComp = calcValues.length > 0
      ? (calcValues.reduce((s, v) => s + v, 0) / calcValues.length / 100) * 40
      : 0;

    const pulseComp = pulseAvgs ? (pulseAvgs.composite / 100) * 30 : 0;

    const consistencyComp = Math.min(dailyStreak / 30, 1) * 12
      + Math.min(weeklyStreak / 12, 1) * 8;

    const virtueComp = latestVirtues
      ? ((latestVirtues.wisdom + latestVirtues.courage + latestVirtues.justice + latestVirtues.temperance) / 4 / 10) * 10
      : 0;

    const momentum = Math.round(calcComp + pulseComp + consistencyComp + virtueComp);

    return NextResponse.json({
      success: true,
      momentum,
      momentumBreakdown: {
        calculators: Math.round(calcComp),
        pulse: Math.round(pulseComp),
        consistency: Math.round(consistencyComp),
        virtues: Math.round(virtueComp),
      },
      pulseHistory,
      pulseAvgs,
      todayPulse,
      latestCalcScores,
      latestVirtues,
      virtueHistory,
      dailyStreak,
      weeklyStreak,
      achievementCount,
      intentionStats,
    });
  } catch (err) {
    console.error("Synthesis GET error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
