import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLAN_COSTS: Record<string, number> = {
  premium_monthly:    1900,
  premium_annual:     15900,
  enterprise_monthly: 9900,
};

const PLAN_TIER: Record<string, "PREMIUM" | "ENTERPRISE"> = {
  premium_monthly:    "PREMIUM",
  premium_annual:     "PREMIUM",
  enterprise_monthly: "ENTERPRISE",
};

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const [subscription, wallet] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.userId } }),
    prisma.bitcoinWallet.findUnique({ where: { userId: session.userId } }),
  ]);

  if (!subscription || !subscription.currentPeriodEnd) {
    return NextResponse.json({ success: true, renewed: false, reason: "no_subscription" });
  }

  const now = new Date();
  if (subscription.currentPeriodEnd > now) {
    return NextResponse.json({ success: true, renewed: false, reason: "not_due" });
  }

  if (!wallet || !wallet.autoRenewEnabled || !wallet.autoRenewPlan) {
    await prisma.subscription.update({
      where: { userId: session.userId },
      data: { tier: "FREE", status: "CANCELED" },
    });
    return NextResponse.json({ success: true, renewed: false, reason: "auto_renew_disabled" });
  }

  const planCost = PLAN_COSTS[wallet.autoRenewPlan];
  if (!planCost) {
    return NextResponse.json({ success: true, renewed: false, reason: "invalid_plan" });
  }

  if (wallet.balanceCents < planCost) {
    await prisma.subscription.update({
      where: { userId: session.userId },
      data: { tier: "FREE", status: "CANCELED" },
    });
    return NextResponse.json({ success: true, renewed: false, reason: "insufficient_balance" });
  }

  const isAnnual = wallet.autoRenewPlan.endsWith("annual");
  const newPeriodStart = now;
  const newPeriodEnd = new Date(now);
  if (isAnnual) newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
  else newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

  const tier = PLAN_TIER[wallet.autoRenewPlan];

  await prisma.$transaction(async (tx) => {
    await tx.bitcoinWallet.update({
      where: { userId: session.userId },
      data: { balanceCents: { decrement: planCost } },
    });

    await tx.subscription.update({
      where: { userId: session.userId },
      data: {
        tier,
        status: "ACTIVE",
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    await tx.payment.create({
      data: {
        userId: session.userId,
        amount: planCost,
        currency: "btc",
        status: "SUCCEEDED",
        description: `Bitcoin wallet auto-renewal — ${wallet.autoRenewPlan}`,
        metadata: { source: "wallet_auto_renew", plan: wallet.autoRenewPlan },
      },
    });
  });

  return NextResponse.json({
    success: true,
    renewed: true,
    newPeriodEnd,
    balanceAfter: wallet.balanceCents - planCost,
    plan: wallet.autoRenewPlan,
  });
}
