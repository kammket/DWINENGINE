import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authResult = await requireAdmin(request as never);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        bitcoinWallet: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscription: user.subscription
        ? {
            tier: user.subscription.tier,
            status: user.subscription.status,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          }
        : null,
      wallet: user.bitcoinWallet
        ? {
            balanceCents: user.bitcoinWallet.balanceCents,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      count: users.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("[admin/users] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
