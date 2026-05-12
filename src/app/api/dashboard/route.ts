import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const [latestAssessment, recentCalculators, trendHistory, simulations, reflectionCount] =
      await Promise.all([
        prisma.assessment.findFirst({
          where: { userId: session.userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.calculatorResult.findMany({
          where: { userId: session.userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, type: true, score: true, createdAt: true },
        }),
        prisma.trendHistory.findMany({
          where: { userId: session.userId },
          orderBy: [{ year: "asc" }, { month: "asc" }],
          take: 12,
        }),
        prisma.scenarioSimulation.findMany({
          where: { userId: session.userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { id: true, title: true, scenarioType: true, createdAt: true },
        }),
        prisma.aiReflection.count({ where: { userId: session.userId } }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        latestAssessment,
        recentCalculators,
        trendHistory,
        recentSimulations: simulations,
        reflectionCount,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}
