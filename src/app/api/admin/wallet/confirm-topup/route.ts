import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ topUpId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "topUpId is required." }, { status: 400 });
  }

  const topUp = await prisma.bitcoinTopUp.findUnique({
    where: { id: parsed.data.topUpId },
    include: { wallet: true },
  });

  if (!topUp) {
    return NextResponse.json({ success: false, error: "Top-up not found." }, { status: 404 });
  }
  if (topUp.status === "CONFIRMED") {
    return NextResponse.json({ success: true, message: "Already confirmed.", alreadyConfirmed: true });
  }
  if (topUp.status !== "PENDING") {
    return NextResponse.json({ success: false, error: `Cannot confirm a ${topUp.status} top-up.` }, { status: 409 });
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.bitcoinTopUp.update({
      where: { id: topUp.id },
      data: { status: "CONFIRMED", confirmedAt: now },
    });

    const wallet = await tx.bitcoinWallet.update({
      where: { id: topUp.walletId },
      data: { balanceCents: { increment: topUp.usdCents } },
    });

    // Auto-set autoRenewPlan based on current subscription if not already set
    if (!wallet.autoRenewPlan) {
      const sub = await tx.subscription.findUnique({ where: { userId: topUp.userId } });
      if (sub && sub.tier !== "FREE") {
        const plan = sub.tier === "ENTERPRISE" ? "enterprise_monthly" : "premium_monthly";
        await tx.bitcoinWallet.update({
          where: { id: topUp.walletId },
          data: { autoRenewPlan: plan },
        });
      }
    }

    await tx.payment.create({
      data: {
        userId: topUp.userId,
        amount: topUp.usdCents,
        currency: "btc",
        status: "SUCCEEDED",
        description: `Bitcoin wallet top-up — $${(topUp.usdCents / 100).toFixed(2)} credit`,
        metadata: { topUpId: topUp.id, satoshis: topUp.satoshis },
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: `Wallet credited $${(topUp.usdCents / 100).toFixed(2)}.`,
    topUpId: topUp.id,
    creditedCents: topUp.usdCents,
  });
}
