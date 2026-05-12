import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { runScenarioSimulation } from "@/lib/calculations";
import { generateScenarioAnalysis } from "@/lib/openai";

const simulateSchema = z.object({
  scenarioType: z.enum([
    "FINANCIAL_IMPROVEMENT",
    "STRESS_REDUCTION",
    "RELATIONSHIP_INVESTMENT",
    "WORK_LIFE_BALANCE",
    "HEALTH_OPTIMIZATION",
  ]),
  title: z.string().min(1).max(200),
  parameters: z.record(z.number()),
  baselineScore: z.number().min(0).max(100),
  includeAiAnalysis: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    // Check subscription for simulations
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        insightCredits: true,
        subscription: { select: { tier: true } },
      },
    });

    if (!user || !user.subscription) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const isFree = user.subscription.tier === "FREE";
    const creditsNeeded = 2;

    if (isFree && user.insightCredits < creditsNeeded) {
      return NextResponse.json(
        {
          success: false,
          error: "Simulations require 2 Insight Credits. Upgrade to Premium for unlimited simulations.",
          upgradeRequired: true,
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const parsed = simulateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid simulation parameters." },
        { status: 400 }
      );
    }

    const { scenarioType, title, parameters, baselineScore, includeAiAnalysis } = parsed.data;

    const { results, projections } = runScenarioSimulation(
      baselineScore,
      scenarioType,
      parameters
    );

    let aiAnalysis: string | null = null;
    if (includeAiAnalysis && !isFree) {
      aiAnalysis = await generateScenarioAnalysis({
        type: scenarioType,
        title,
        currentScore: results.currentScore,
        projectedScore: results.projectedScore,
        stressChange: results.stressChange,
        financialChange: results.financialChange,
      });
    }

    // Save simulation and deduct credits
    const saved = await prisma.$transaction(async (tx) => {
      const sim = await tx.scenarioSimulation.create({
        data: {
          userId: session.userId,
          scenarioType,
          title,
          parameters: parameters as object,
          results: results as object,
          projections: projections as unknown as object,
          creditsUsed: isFree ? creditsNeeded : 0,
        },
      });

      if (isFree) {
        await tx.user.update({
          where: { id: session.userId },
          data: { insightCredits: { decrement: creditsNeeded } },
        });
      }

      return sim;
    });

    return NextResponse.json({
      success: true,
      simulation: saved,
      results,
      projections,
      aiAnalysis,
    });
  } catch (err) {
    console.error("Simulation error:", err);
    return NextResponse.json(
      { success: false, error: "Simulation failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const simulations = await prisma.scenarioSimulation.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ success: true, simulations });
}
