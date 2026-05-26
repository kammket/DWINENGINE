import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBtcPriceUsd, usdCentsToUniqueSatoshis } from "@/lib/bitcoin";

const VALID_AMOUNTS = [2000, 5000, 10000, 20000] as const; // $20, $50, $100, $200

const schema = z.object({
  usdCents: z.union([
    z.literal(2000),
    z.literal(5000),
    z.literal(10000),
    z.literal(20000),
  ]),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const btcAddress = process.env.BITCOIN_ADDRESS;
  if (!btcAddress?.trim()) {
    return NextResponse.json(
      { success: false, error: "Bitcoin payments are not configured." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: `Invalid amount. Choose from: ${VALID_AMOUNTS.map((c) => `$${c / 100}`).join(", ")}.` },
      { status: 400 }
    );
  }

  const existing = await prisma.bitcoinTopUp.findFirst({
    where: { userId: session.userId, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "You already have a pending top-up.", topUpId: existing.id },
      { status: 409 }
    );
  }

  const wallet = await prisma.bitcoinWallet.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId },
    update: {},
  });

  const btcPrice = await getBtcPriceUsd();
  const id = randomBytes(12).toString("hex");
  const satoshis = usdCentsToUniqueSatoshis(parsed.data.usdCents, btcPrice, id);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const topUp = await prisma.bitcoinTopUp.create({
    data: {
      id,
      userId: session.userId,
      walletId: wallet.id,
      usdCents: parsed.data.usdCents,
      btcAddress,
      satoshis,
      expiresAt,
    },
  });

  return NextResponse.json({ success: true, topUpId: topUp.id });
}
