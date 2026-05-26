import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBtcPriceUsd, usdCentsToUniqueSatoshis } from "@/lib/bitcoin";

const BTC_PLANS: Record<
  string,
  { usdCents: number; tier: "PREMIUM" | "ENTERPRISE"; label: string }
> = {
  premium_monthly:    { usdCents: 1900,  tier: "PREMIUM",    label: "Premium Monthly"    },
  premium_annual:     { usdCents: 15900, tier: "PREMIUM",    label: "Premium Annual"     },
  enterprise_monthly: { usdCents: 9900,  tier: "ENTERPRISE", label: "Enterprise Monthly" },
};

const schema = z.object({
  plan: z.enum(["premium_monthly", "premium_annual", "enterprise_monthly"]),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid plan." }, { status: 400 });
    }

    const planConfig = BTC_PLANS[parsed.data.plan];

    // Prefer wallet balance for instant activation before creating a new invoice.
    const wallet = await prisma.bitcoinWallet.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId },
      update: {},
      select: { balanceCents: true },
    });

    if (wallet.balanceCents >= planConfig.usdCents) {
      const now = new Date();
      const periodEnd = new Date(now);
      const isAnnual = parsed.data.plan.endsWith("annual");
      if (isAnnual) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setMonth(periodEnd.getMonth() + 1);

      await prisma.$transaction(async (tx) => {
        await tx.bitcoinWallet.update({
          where: { userId: session.userId },
          data: { balanceCents: { decrement: planConfig.usdCents } },
        });

        await tx.subscription.upsert({
          where: { userId: session.userId },
          create: {
            userId: session.userId,
            tier: planConfig.tier,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
          update: {
            tier: planConfig.tier,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
        });

        await tx.payment.create({
          data: {
            userId: session.userId,
            amount: planConfig.usdCents,
            currency: "btc",
            status: "SUCCEEDED",
            description: `Bitcoin wallet upgrade — ${parsed.data.plan}`,
            metadata: { source: "wallet_upgrade", plan: parsed.data.plan },
          },
        });
      });

      return NextResponse.json({
        success: true,
        upgraded: true,
        source: "wallet",
        plan: parsed.data.plan,
      });
    }

    const btcAddress = process.env.BITCOIN_ADDRESS;
    if (!btcAddress || btcAddress.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Bitcoin payments are not yet configured." },
        { status: 503 }
      );
    }

    const btcPrice = await getBtcPriceUsd();

    // Cryptographically random invoice ID (no ESM dependency)
    const id = randomBytes(12).toString("hex"); // 24 hex chars
    const satoshis = usdCentsToUniqueSatoshis(planConfig.usdCents, btcPrice, id);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const invoice = await prisma.bitcoinInvoice.create({
      data: {
        id,
        userId: session.userId,
        plan: parsed.data.plan,
        usdAmount: planConfig.usdCents,
        btcAddress,
        satoshis,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      upgraded: false,
      source: "invoice",
      invoiceId: invoice.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("BTC invoice creation error:", msg);
    return NextResponse.json(
      { success: false, error: `Failed to create invoice: ${msg}` },
      { status: 500 }
    );
  }
}
