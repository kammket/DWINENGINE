import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { computeDailyStreak, getDateKey } from "@/lib/pulse";

const pulseSchema = z.object({
  energy: z.number().int().min(1).max(10),
  calm: z.number().int().min(1).max(10),
  clarity: z.number().int().min(1).max(10),
  gratitude: z.number().int().min(1).max(10),
  connection: z.number().int().min(1).max(10),
  note: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const pulses = await prisma.dailyPulse.findMany({
      where: { userId: session.userId, createdAt: { gte: cutoff } },
      orderBy: { date: "desc" },
      take: 30,
    });

    const today = getDateKey();
    const todayPulse = pulses.find((p) => p.date === today) ?? null;
    const streak = computeDailyStreak(pulses.map((p) => ({ date: p.date })));

    return NextResponse.json({ success: true, today: todayPulse, history: pulses, streak });
  } catch (err) {
    console.error("Pulse GET error:", err);
    return NextResponse.json({ success: false, today: null, history: [], streak: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = pulseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });
  }

  const date = getDateKey();
  const pulse = await prisma.dailyPulse.upsert({
    where: { userId_date: { userId: session.userId, date } },
    create: { userId: session.userId, date, ...parsed.data },
    update: { ...parsed.data },
  });

  const allPulses = await prisma.dailyPulse.findMany({
    where: { userId: session.userId },
    select: { date: true },
  });
  const streak = computeDailyStreak(allPulses);

  return NextResponse.json({ success: true, pulse, streak });
}
