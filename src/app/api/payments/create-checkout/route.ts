import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, PLANS } from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["premium_monthly", "premium_annual", "enterprise_monthly"]),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selection." },
        { status: 400 }
      );
    }

    const { plan } = parsed.data;
    const planConfig = PLANS[plan];

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await createCheckoutSession(
      session.userId,
      user.email,
      planConfig.priceId,
      `${appUrl}/dashboard?upgraded=true`,
      `${appUrl}/pricing?canceled=true`
    );

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
