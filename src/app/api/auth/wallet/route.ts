import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";
import { createToken, setSessionCookie, rateLimit } from "@/lib/auth";
import { consumeNonce, buildSignMessage } from "@/lib/walletNonce";

const schema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().min(1),
  nonce: z.string().min(1),
  // Optional — only required for first-time wallet registration
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`wallet-auth:${ip}`, 10, 60_000)) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const { address, signature, nonce, email, name } = parsed.data;

  // 1. Verify the nonce is valid and consume it (one-time use)
  if (!consumeNonce(address, nonce)) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired nonce. Please try again." },
      { status: 401 }
    );
  }

  // 2. Reconstruct the exact message and recover the signing address
  const message = buildSignMessage(address, nonce);
  let recovered: string;
  try {
    recovered = ethers.verifyMessage(message, signature);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
  }

  // 3. Recovered address must match the claimed address (case-insensitive)
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ success: false, error: "Signature mismatch" }, { status: 401 });
  }

  const normalizedAddress = address.toLowerCase();

  // 4. Find existing user by wallet address
  let user = await prisma.user.findUnique({
    where: { walletAddress: normalizedAddress },
    select: { id: true, email: true, name: true, role: true, onboardingDone: true },
  });

  // 5. New wallet — require email to create account
  if (!user) {
    if (!email) {
      return NextResponse.json(
        { success: false, error: "wallet_not_found", message: "No account found for this wallet. Please provide your email to register." },
        { status: 404 }
      );
    }

    // Check email isn't already taken by a non-wallet account
    const emailConflict = await prisma.user.findUnique({ where: { email } });
    if (emailConflict) {
      // Link wallet to existing email account instead
      user = await prisma.user.update({
        where: { email },
        data: { walletAddress: normalizedAddress },
        select: { id: true, email: true, name: true, role: true, onboardingDone: true },
      });
    } else {
      // Create brand new wallet-first account
      user = await prisma.user.create({
        data: {
          walletAddress: normalizedAddress,
          email,
          name: name ?? `User ${address.slice(0, 6)}`,
          subscription: { create: { tier: "FREE", status: "ACTIVE" } },
        },
        select: { id: true, email: true, name: true, role: true, onboardingDone: true },
      });
    }
  }

  // 6. Issue JWT session — same mechanism as email/password login
  const token = await createToken({
    userId: user.id,
    email: user.email ?? "",
    role: user.role,
  });

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
    isNewUser: !user.onboardingDone,
  });

  return setSessionCookie(res, token);
}
