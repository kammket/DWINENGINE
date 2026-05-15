import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyPassword, hashPassword, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        onboardingDone: true,
        subscription: {
          select: { tier: true, status: true, currentPeriodEnd: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json(
      { success: false, error: "Session verification failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Update name
    if (body.name !== undefined) {
      const parsed = z.string().min(2).max(100).safeParse(body.name);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: "Name must be 2–100 characters." }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: session.userId },
        data: { name: parsed.data },
      });
      return NextResponse.json({ success: true });
    }

    // Change password
    if (body.currentPassword && body.newPassword) {
      const pwSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/);
      if (!pwSchema.safeParse(body.newPassword).success) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 chars, include an uppercase letter and a number." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { passwordHash: true },
      });
      if (!user?.passwordHash) {
        return NextResponse.json({ success: false, error: "Cannot change password for this account." }, { status: 400 });
      }

      const valid = await verifyPassword(body.currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 401 });
      }

      const newHash = await hashPassword(body.newPassword);
      await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: newHash } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Nothing to update." }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Delete user and all cascaded data (Prisma cascade handles it)
    await prisma.user.delete({ where: { id: session.userId } });

    const res = NextResponse.json({ success: true });
    return clearSessionCookie(res);
  } catch {
    return NextResponse.json({ success: false, error: "Account deletion failed." }, { status: 500 });
  }
}

