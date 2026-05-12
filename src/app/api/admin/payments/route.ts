/**
 * GET /api/admin/payments
 * Returns pending Bitcoin invoices + recent payment history for the admin panel.
 * Admin-only in production; any authenticated user in development.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
  } else {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
  }

  const [pendingInvoices, recentPayments] = await Promise.all([
    prisma.bitcoinInvoice.findMany({
      where: { status: { in: ["PENDING", "MEMPOOL"] } },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payment.findMany({
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({ success: true, pendingInvoices, recentPayments });
}
