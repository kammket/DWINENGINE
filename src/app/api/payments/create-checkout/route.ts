import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { createCheckoutSession, createCustomerPortalSession, PLANS } from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["premium_monthly", "premium_annual", "enterprise_monthly"]).optional(),
  planId: z.enum(["premium_monthly", "premium_annual", "enterprise_monthly"]).optional(),
  priceId: z.string().min(1).optional(),
  portal: z.boolean().optional(),
  returnUrl: z.string().url().optional(),
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

    const { plan, planId, priceId, portal, returnUrl } = parsed.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (portal) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: session.userId },
        select: { stripeCustomerId: true },
      });

      if (!subscription?.stripeCustomerId) {
        return NextResponse.json(
          { success: false, error: "No billing account found for this user yet." },
          { status: 400 }
        );
      }

      const portalSession = await createCustomerPortalSession(
        subscription.stripeCustomerId,
        returnUrl || `${appUrl}/settings`
      );

      return NextResponse.json({ success: true, url: portalSession.url });
    }

    const resolvedPlan =
      plan ??
      planId ??
      (priceId ? (Object.entries(PLANS).find(([, config]) => config.priceId === priceId)?.[0] as keyof typeof PLANS | undefined) : undefined);

    if (!resolvedPlan || !PLANS[resolvedPlan]) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selection." },
        { status: 400 }
      );
    }

    const planConfig = PLANS[resolvedPlan];

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Billing is temporarily unavailable. Stripe secret key is missing." },
        { status: 503 }
      );
    }

    if (!planConfig.priceId || !planConfig.priceId.trim()) {
      return NextResponse.json(
        { success: false, error: "Selected plan is not configured yet. Please contact support." },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

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

    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error:
            err.message ||
            "Stripe could not create a checkout session. Please verify billing configuration.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
