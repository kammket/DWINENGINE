/**
 * POST /api/admin/bitcoin/force-confirm
 *
 * Dev/admin-only endpoint that simulates an on-chain Bitcoin confirmation
 * without requiring a real transaction. Useful for testing the full Bitcoin
 * payment flow locally.
 *
 * Body: { invoiceId: string }
 *
 * Guards:
 *  - Blocked in production unless the caller is an ADMIN
 *  - In development any authenticated user can call it (for local testing)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  invoiceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";

  // In production require ADMIN role; in dev any authenticated user is fine
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
      { success: false, error: "invoiceId is required." },
      { status: 400 }
    );
  }

  const { invoiceId } = parsed.data;

  const invoice = await prisma.bitcoinInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    return NextResponse.json({ success: false, error: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status === "CONFIRMED") {
    return NextResponse.json({ success: true, message: "Invoice already confirmed.", alreadyConfirmed: true });
  }

  if (invoice.status === "EXPIRED") {
    return NextResponse.json({ success: false, error: "Invoice has already expired." }, { status: 409 });
  }

  const tier = invoice.plan.startsWith("enterprise") ? "ENTERPRISE" : "PREMIUM";
  const isAnnual = invoice.plan.endsWith("annual");
  const now = new Date();
  const periodEnd = new Date(now);
  if (isAnnual) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  const fakeTxid = `SIMULATED_${Date.now().toString(16).toUpperCase()}`;

  await prisma.$transaction(async (tx) => {
    await tx.bitcoinInvoice.update({
      where: { id: invoiceId },
      data: { status: "CONFIRMED", txid: fakeTxid, confirmedAt: now },
    });

    await tx.subscription.upsert({
      where: { userId: invoice.userId },
      create: {
        userId: invoice.userId,
        tier,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        tier,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    await tx.payment.create({
      data: {
        userId: invoice.userId,
        amount: invoice.usdAmount,
        currency: "btc",
        status: "SUCCEEDED",
        description: `Bitcoin (simulated) — ${invoice.plan}`,
        metadata: { txid: fakeTxid, satoshis: invoice.satoshis, simulated: true },
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: "Invoice force-confirmed. Subscription upgraded.",
    invoiceId,
    tier,
    fakeTxid,
  });
}
