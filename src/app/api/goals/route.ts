import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const goalSchema = z.object({
  calculatorType: z.enum([
    "FINANCIAL_PEACE",
    "BURNOUT_RISK",
    "RELATIONSHIP_SUSTAINABILITY",
    "DECISION_REGRET",
    "TIME_VALUE",
  ]),
  targetScore: z.number().int().min(1).max(100),
  targetDate: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const goals = await prisma.userGoal.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  // Attach latest score for each goal
  const withProgress = await Promise.all(
    goals.map(async (goal) => {
      const latest = await prisma.calculatorResult.findFirst({
        where: { userId: session.userId, type: goal.calculatorType },
        orderBy: { createdAt: "desc" },
        select: { score: true },
      });
      return { ...goal, currentScore: latest?.score ?? null };
    })
  );

  return NextResponse.json({ success: true, goals: withProgress });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });
  }

  const { calculatorType, targetScore, targetDate } = parsed.data;

  // Fetch start score from most recent calc result
  const latest = await prisma.calculatorResult.findFirst({
    where: { userId: session.userId, type: calculatorType },
    orderBy: { createdAt: "desc" },
    select: { score: true },
  });

  const goal = await prisma.userGoal.upsert({
    where: { userId_calculatorType: { userId: session.userId, calculatorType } },
    create: {
      userId: session.userId,
      calculatorType,
      targetScore,
      startScore: latest?.score ?? null,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
    update: {
      targetScore,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  return NextResponse.json({ success: true, goal });
}
