import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import type { AchievementType } from "@prisma/client";

type UnlockCandidate = { type: AchievementType; metadata?: object };

async function computeEarnedAchievements(userId: string): Promise<UnlockCandidate[]> {
  const earned: UnlockCandidate[] = [];

  const [calcResults, reflections, goals, simulations, checkins] = await Promise.all([
    prisma.calculatorResult.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.aiReflection.findMany({ where: { userId }, take: 1 }),
    prisma.userGoal.findMany({ where: { userId } }),
    prisma.scenarioSimulation.findMany({ where: { userId }, take: 1 }),
    prisma.weeklyCheckin.findMany({ where: { userId }, orderBy: { weekKey: "desc" } }),
  ]);

  // FIRST_CALCULATOR
  if (calcResults.length >= 1) earned.push({ type: "FIRST_CALCULATOR" });

  // ALL_CALCULATORS_DONE — at least one result per calculator type
  const types = new Set(calcResults.map((r) => r.type));
  if (types.size >= 5) earned.push({ type: "ALL_CALCULATORS_DONE" });

  // Latest overall score proxy — average of latest per-type scores
  const latestByType = new Map<string, number>();
  for (const r of calcResults) {
    latestByType.set(r.type, r.score); // asc order so last wins = latest
  }
  if (latestByType.size > 0) {
    const avg = [...latestByType.values()].reduce((a, b) => a + b, 0) / latestByType.size;
    if (avg >= 50) earned.push({ type: "SCORE_STABLE" });
    if (avg >= 70) earned.push({ type: "SCORE_THRIVING" });
    if (avg >= 85) earned.push({ type: "SCORE_FLOURISHING" });
  }

  // IMPROVED_10_POINTS — any single calculator improved ≥10 pts
  const typeList = [...types];
  for (const t of typeList) {
    const forType = calcResults.filter((r) => r.type === t);
    if (forType.length >= 2) {
      const first = forType[0].score;
      const last = forType[forType.length - 1].score;
      if (last - first >= 10) {
        earned.push({ type: "IMPROVED_10_POINTS" });
        break;
      }
    }
  }

  // STREAK achievements
  if (checkins.length >= 4) earned.push({ type: "STREAK_4_WEEKS" });
  if (checkins.length >= 8) earned.push({ type: "STREAK_8_WEEKS" });
  if (checkins.length >= 12) earned.push({ type: "STREAK_12_WEEKS" });

  // FIRST_REFLECTION
  if (reflections.length >= 1) earned.push({ type: "FIRST_REFLECTION" });

  // FIRST_GOAL
  if (goals.length >= 1) earned.push({ type: "FIRST_GOAL" });

  // GOAL_REACHED
  const reached = await prisma.userGoal.findFirst({ where: { userId, reachedAt: { not: null } } });
  if (reached) earned.push({ type: "GOAL_REACHED" });

  // FIRST_SIMULATION
  if (simulations.length >= 1) earned.push({ type: "FIRST_SIMULATION" });

  return earned;
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const earned = await computeEarnedAchievements(session.userId);

  // Upsert newly earned achievements
  const existing = await prisma.achievement.findMany({
    where: { userId: session.userId },
    select: { type: true },
  });
  const existingTypes = new Set(existing.map((a) => a.type));

  const newOnes = earned.filter((e) => !existingTypes.has(e.type));
  if (newOnes.length > 0) {
    await prisma.achievement.createMany({
      data: newOnes.map((e) => ({
        userId: session.userId,
        type: e.type,
        ...(e.metadata !== undefined ? { metadata: e.metadata } : {}),
      })),
      skipDuplicates: true,
    });
  }

  const all = await prisma.achievement.findMany({
    where: { userId: session.userId },
    orderBy: { unlockedAt: "asc" },
  });

  return NextResponse.json({ success: true, achievements: all, newlyUnlocked: newOnes.map((e) => e.type) });
}
