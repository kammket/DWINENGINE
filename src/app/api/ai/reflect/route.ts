import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateReflection } from "@/lib/openai";

const reflectSchema = z.object({
  scores: z.record(z.number().min(0).max(100)),
  calculatorType: z.string().optional(),
  userQuestion: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    // Check user has credits
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        insightCredits: true,
        subscription: { select: { tier: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const isFree = user.subscription?.tier === "FREE";
    if (isFree && user.insightCredits <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient Insight Credits. Upgrade to Premium for unlimited AI reflections.",
          upgradeRequired: true,
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const parsed = reflectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const reflection = await generateReflection(parsed.data);

    // Save reflection and deduct credits (only for free tier)
    const [saved] = await prisma.$transaction([
      prisma.aiReflection.create({
        data: {
          userId: session.userId,
          prompt: JSON.stringify(parsed.data),
          reflection,
          creditsUsed: isFree ? 1 : 0,
        },
      }),
      ...(isFree
        ? [
            prisma.user.update({
              where: { id: session.userId },
              data: { insightCredits: { decrement: 1 } },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      success: true,
      reflection: saved.reflection,
      creditsRemaining: isFree ? user.insightCredits - 1 : null,
    });
  } catch (err) {
    console.error("AI reflection error:", err);
    return NextResponse.json(
      { success: false, error: "Reflection generation failed. Please try again." },
      { status: 500 }
    );
  }
}
