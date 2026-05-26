import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLAN_COSTS: Record<string, number> = {
  premium_monthly:    1900,
  premium_annual:     15900,
  enterprise_monthly: 9900,
};

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const [wallet, subscription] = await Promise.all([
    prisma.bitcoinWallet.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId },
      update: {},
      include: {
        topUps: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.subscription.findUnique({ where: { userId: session.userId } }),
  ]);

  const pendingTopUp = wallet.topUps.find((t) => t.status === "PENDING") ?? null;

  return NextResponse.json({
    success: true,
    wallet: {
      id: wallet.id,
      balanceCents: wallet.balanceCents,
      autoRenewPlan: wallet.autoRenewPlan,
      autoRenewEnabled: wallet.autoRenewEnabled,
    },
    pendingTopUp: pendingTopUp
      ? {
          id: pendingTopUp.id,
          usdCents: pendingTopUp.usdCents,
          status: pendingTopUp.status,
          expiresAt: pendingTopUp.expiresAt,
        }
      : null,
    subscription: subscription
      ? {
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        }
      : null,
    planCosts: PLAN_COSTS,
  });
}

const patchSchema = z.object({
  autoRenewPlan: z
    .enum(["premium_monthly", "premium_annual", "enterprise_monthly"])
    .nullable()
    .optional(),
  autoRenewEnabled: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid fields." }, { status: 400 });
  }

  const wallet = await prisma.bitcoinWallet.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ success: true, wallet });
}
