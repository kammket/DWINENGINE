import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topupId: string }> }
) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const { topupId } = await params;
  const topUp = await prisma.bitcoinTopUp.findUnique({
    where: { id: topupId },
    select: {
      userId: true,
      id: true,
      usdCents: true,
      btcAddress: true,
      satoshis: true,
      status: true,
      expiresAt: true,
      confirmedAt: true,
      adminNote: true,
    },
  });

  if (!topUp) {
    return NextResponse.json({ success: false, error: "Top-up not found." }, { status: 404 });
  }

  if (topUp.userId !== session.userId) {
    return NextResponse.json({ success: false, error: "Top-up not found." }, { status: 404 });
  }

  // Keep status accurate if a pending invoice has expired.
  if (topUp.status === "PENDING" && topUp.expiresAt < new Date()) {
    await prisma.bitcoinTopUp.update({
      where: { id: topUp.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({
      success: true,
      topUp: {
        ...topUp,
        status: "EXPIRED",
      },
    });
  }

  return NextResponse.json({ success: true, topUp });
}
