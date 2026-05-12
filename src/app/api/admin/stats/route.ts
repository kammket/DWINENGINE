import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authResult = await requireAdmin(request as never);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersByTier,
      activeUsers30d,
      totalCalculations,
      totalAiReflections,
      totalSimulations,
      signupsByDay,
      calculatorBreakdown,
      avgScores,
      paidSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.groupBy({ by: ["tier"], _count: { _all: true } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.calculatorResult.count(),
      prisma.aiReflection.count(),
      prisma.scenarioSimulation.count(),
      // Signups per day (last 30 days)
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      // Calculator usage breakdown
      prisma.calculatorResult.groupBy({
        by: ["type"],
        _count: { _all: true },
        orderBy: { _count: { type: "desc" } },
      }),
      // Avg score per calculator type
      prisma.calculatorResult.groupBy({
        by: ["type"],
        _avg: { score: true },
      }),
      // Active paid subscriptions for MRR
      prisma.subscription.findMany({
        where: { status: "ACTIVE", tier: { not: "FREE" } },
        select: { tier: true },
      }),
    ]);

    // Calculate MRR
    const PLAN_MRR: Record<string, number> = { PREMIUM: 19, ENTERPRISE: 99 };
    const mrr = paidSubscriptions.reduce((sum, s) => sum + (PLAN_MRR[s.tier] || 0), 0);

    // Map tier counts
    const tierMap: Record<string, number> = { FREE: 0, PREMIUM: 0, ENTERPRISE: 0 };
    usersByTier.forEach((t) => { tierMap[t.tier] = t._count._all; });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers30d,
        freeUsers: tierMap.FREE,
        premiumUsers: tierMap.PREMIUM,
        enterpriseUsers: tierMap.ENTERPRISE,
        totalCalculations,
        totalAiReflections,
        totalSimulations,
        mrr,
        signupsByDay: signupsByDay.map((r) => ({ date: String(r.date), count: Number(r.count) })),
        calculatorBreakdown: calculatorBreakdown.map((c) => ({
          type: c.type,
          count: c._count._all,
        })),
        avgScores: Object.fromEntries(
          avgScores.map((a) => [a.type, Math.round((a._avg.score || 0) * 10) / 10])
        ),
      },
    });
  } catch (err) {
    console.error("[Admin Stats Error]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch stats." }, { status: 500 });
  }
}
