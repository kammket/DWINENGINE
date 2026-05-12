/**
 * POST /api/admin/subscription/set
 *
 * Dev/admin-only endpoint to instantly set any user's subscription tier.
 * Useful for testing gated features across FREE / PREMIUM / ENTERPRISE
 * without going through the full payment flow.
 *
 * Body: { email: string; tier: "FREE" | "PREMIUM" | "ENTERPRISE" }
 *
 * Guards:
 *  - Blocked in production unless the caller is an ADMIN
 *  - In development any authenticated user can call it
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  tier: z.enum(["FREE", "PREMIUM", "ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
  } else {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  const { email, tier } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 10); // effectively unlimited for dev

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tier,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: tier !== "FREE" ? periodEnd : null,
    },
    update: {
      tier,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: tier !== "FREE" ? periodEnd : null,
      cancelAtPeriodEnd: false,
    },
  });

  return NextResponse.json({
    success: true,
    message: `${user.email} subscription set to ${tier}.`,
    user: { id: user.id, name: user.name, email: user.email, tier },
  });
}
