import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { calculateOverallAssessment } from "@/lib/calculations";

const onboardingSchema = z.object({
  ageRange: z.string().optional(),
  workType: z.string().optional(),
  stressPerception: z.number().min(1).max(10),
  financialComfort: z.number().min(1).max(10),
  timeFreedom: z.number().min(1).max(10),
  relationshipSupport: z.number().min(1).max(10),
  energyLevels: z.number().min(1).max(10),
  cognitiveLoad: z.number().min(1).max(10),
  majorResponsibilities: z.array(z.string()).optional().default([]),
  goals: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid onboarding data." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const scores = calculateOverallAssessment({
      stressPerception: data.stressPerception,
      financialComfort: data.financialComfort,
      timeFreedom: data.timeFreedom,
      relationshipSupport: data.relationshipSupport,
      energyLevels: data.energyLevels,
      cognitiveLoad: data.cognitiveLoad,
    });

    // Upsert profile, create initial assessment, mark onboarding done
    await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          ...data,
        },
        update: { ...data },
      }),
      prisma.assessment.create({
        data: {
          userId: session.userId,
          ...scores,
          rawInputs: data as object,
        },
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { onboardingDone: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      scores,
      message: "Onboarding complete.",
    });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { success: false, error: "Onboarding failed. Please try again." },
      { status: 500 }
    );
  }
}
