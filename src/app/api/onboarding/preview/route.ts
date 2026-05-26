import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateOverallAssessment } from "@/lib/calculations";

const previewSchema = z.object({
  stressPerception: z.number().min(1).max(10),
  financialComfort: z.number().min(1).max(10),
  timeFreedom: z.number().min(1).max(10),
  relationshipSupport: z.number().min(1).max(10),
  energyLevels: z.number().min(1).max(10),
  cognitiveLoad: z.number().min(1).max(10),
});

// Public endpoint — returns scores without requiring auth or persisting data.
// Used by the guest onboarding preview screen.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = previewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input." }, { status: 400 });
    }
    const scores = calculateOverallAssessment(parsed.data);
    return NextResponse.json({ success: true, scores });
  } catch {
    return NextResponse.json({ success: false, error: "Preview failed." }, { status: 500 });
  }
}
