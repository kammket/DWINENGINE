import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  calculateFinancialPeace,
  calculateBurnoutRisk,
  calculateRelationshipSustainability,
  calculateDecisionRegret,
  calculateTimeValue,
} from "@/lib/calculations";
import type { CalculatorType } from "@/types";

const calculatorSchema = z.object({
  type: z.enum([
    "FINANCIAL_PEACE",
    "BURNOUT_RISK",
    "RELATIONSHIP_SUSTAINABILITY",
    "DECISION_REGRET",
    "TIME_VALUE",
  ]),
  inputs: z.record(z.union([z.number(), z.string(), z.boolean()])),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const parsed = calculatorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid calculator inputs." },
        { status: 400 }
      );
    }

    const { type, inputs } = parsed.data;

    let result;
    switch (type as CalculatorType) {
      case "FINANCIAL_PEACE":
        result = calculateFinancialPeace(inputs as Parameters<typeof calculateFinancialPeace>[0]);
        break;
      case "BURNOUT_RISK":
        result = calculateBurnoutRisk(inputs as Parameters<typeof calculateBurnoutRisk>[0]);
        break;
      case "RELATIONSHIP_SUSTAINABILITY":
        result = calculateRelationshipSustainability(inputs as Parameters<typeof calculateRelationshipSustainability>[0]);
        break;
      case "DECISION_REGRET":
        result = calculateDecisionRegret(inputs as Parameters<typeof calculateDecisionRegret>[0]);
        break;
      case "TIME_VALUE":
        result = calculateTimeValue(inputs as Parameters<typeof calculateTimeValue>[0]);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Unknown calculator type." },
          { status: 400 }
        );
    }

    // Persist result
    const saved = await prisma.calculatorResult.create({
      data: {
        userId: session.userId,
        type: type as CalculatorType,
        inputs: inputs as object,
        outputs: result.outputs as object,
        score: result.score,
        interpretation: result.interpretation,
        suggestions: result.suggestions,
      },
    });

    return NextResponse.json({ success: true, result: saved });
  } catch (err) {
    console.error("Calculator error:", err);
    return NextResponse.json(
      { success: false, error: "Calculation failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as CalculatorType | null;
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  const results = await prisma.calculatorResult.findMany({
    where: {
      userId: session.userId,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ success: true, results });
}
