import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBitcoinPayment } from "@/lib/bitcoin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  const invoice = await prisma.bitcoinInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  // Return cached terminal states immediately
  if (invoice.status === "CONFIRMED") {
    return NextResponse.json({
      status: "CONFIRMED",
      txid: invoice.txid,
      plan: invoice.plan,
      usdAmount: invoice.usdAmount,
      btcAddress: invoice.btcAddress,
      satoshis: invoice.satoshis,
      expiresAt: invoice.expiresAt.toISOString(),
    });
  }

  if (invoice.status === "EXPIRED") {
    return NextResponse.json({ status: "EXPIRED" });
  }

  // Expire overdue invoices
  if (invoice.expiresAt < new Date()) {
    await prisma.bitcoinInvoice.update({
      where: { id: invoiceId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ status: "EXPIRED" });
  }

  // Poll blockchain for this invoice
  const result = await checkBitcoinPayment(
    invoice.btcAddress,
    invoice.satoshis,
    Math.floor(invoice.createdAt.getTime() / 1000)
  );

  const basePayload = {
    plan: invoice.plan,
    usdAmount: invoice.usdAmount,
    btcAddress: invoice.btcAddress,
    satoshis: invoice.satoshis,
    expiresAt: invoice.expiresAt.toISOString(),
  };

  if (!result.found) {
    return NextResponse.json({ ...basePayload, status: invoice.status });
  }

  if (!result.confirmed) {
    // Seen in mempool — update status if not already done
    if (invoice.status !== "MEMPOOL") {
      await prisma.bitcoinInvoice.update({
        where: { id: invoiceId },
        data: { status: "MEMPOOL", txid: result.txid },
      });
    }
    return NextResponse.json({ ...basePayload, status: "MEMPOOL", txid: result.txid });
  }

  // Confirmed on-chain — upgrade the subscription in a transaction
  const tier = invoice.plan.startsWith("enterprise") ? "ENTERPRISE" : "PREMIUM";
  const isAnnual = invoice.plan.endsWith("annual");
  const now = new Date();
  const periodEnd = new Date(now);
  if (isAnnual) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.$transaction(async (tx) => {
    await tx.bitcoinInvoice.update({
      where: { id: invoiceId },
      data: { status: "CONFIRMED", txid: result.txid, confirmedAt: now },
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
        description: `Bitcoin — ${invoice.plan}`,
        metadata: { txid: result.txid, satoshis: invoice.satoshis },
      },
    });
  });

  return NextResponse.json({
    ...basePayload,
    status: "CONFIRMED",
    txid: result.txid,
  });
}
