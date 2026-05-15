import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { tierGate } from "@/lib/tier";

const MAX_KEYS = 10;

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscription: { select: { tier: true } } },
  });

  const gate = tierGate(user?.subscription?.tier, "ENTERPRISE", "API key management");
  if (gate) return gate;

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.userId, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true },
  });

  return NextResponse.json({ success: true, keys });
}

const createSchema = z.object({ name: z.string().min(1).max(80) });

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscription: { select: { tier: true } } },
  });

  const gate = tierGate(user?.subscription?.tier, "ENTERPRISE", "API key management");
  if (gate) return gate;

  const existing = await prisma.apiKey.count({
    where: { userId: session.userId, revokedAt: null },
  });
  if (existing >= MAX_KEYS) {
    return NextResponse.json({ success: false, error: `Maximum of ${MAX_KEYS} active keys allowed.` }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid key name." }, { status: 400 });
  }

  // Generate: csv_ + 32 random hex chars
  const raw = "csv_" + randomBytes(16).toString("hex");
  const prefix = raw.slice(0, 12); // "csv_" + 8 chars shown in UI
  const keyHash = hashKey(raw);

  const key = await prisma.apiKey.create({
    data: { userId: session.userId, name: parsed.data.name, keyHash, prefix },
    select: { id: true, name: true, prefix: true, createdAt: true },
  });

  // Return the raw key once — never stored in plaintext
  return NextResponse.json({ success: true, key, rawKey: raw }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscription: { select: { tier: true } } },
  });

  const gate = tierGate(user?.subscription?.tier, "ENTERPRISE", "API key management");
  if (gate) return gate;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing key id." }, { status: 400 });

  const key = await prisma.apiKey.findFirst({ where: { id, userId: session.userId } });
  if (!key) return NextResponse.json({ success: false, error: "Key not found." }, { status: 404 });

  await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  return NextResponse.json({ success: true });
}
