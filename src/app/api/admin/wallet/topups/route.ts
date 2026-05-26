import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const [pendingTopUps, recentTopUps] = await Promise.all([
    prisma.bitcoinTopUp.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.bitcoinTopUp.findMany({
      where: { status: { in: ["CONFIRMED", "REJECTED", "EXPIRED"] } },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({ success: true, pendingTopUps, recentTopUps });
}
