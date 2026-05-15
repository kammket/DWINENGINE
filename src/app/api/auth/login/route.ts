import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createToken,
  setSessionCookie,
  rateLimit,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 login attempts per IP per 15 minutes
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: {
          select: { tier: true, status: true, currentPeriodEnd: true },
        },
      },
    });

    // Timing-safe: always run bcrypt even if user not found
    const dummyHash =
      "$2a$12$dummy.hash.to.prevent.timing.attacks.xxxxxxxxxxxxxxxxxxxxxxx";
    const isValid = user
      ? await verifyPassword(password, user.passwordHash || dummyHash)
      : await verifyPassword(password, dummyHash).then(() => false);

    if (!user || !isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email ?? "",
      role: user.role,
    });

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email ?? "",
      avatarUrl: user.avatarUrl,
      role: user.role,
      onboardingDone: user.onboardingDone,
      subscription: user.subscription,
    };

    const res = NextResponse.json({
      success: true,
      user: publicUser,
    });

    return setSessionCookie(res, token);
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
