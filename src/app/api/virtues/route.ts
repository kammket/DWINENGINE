import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { historyDateCutoff } from "@/lib/tier";

function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const virtueSchema = z.object({
  wisdom: z.number().int().min(1).max(10),
  courage: z.number().int().min(1).max(10),
  justice: z.number().int().min(1).max(10),
  temperance: z.number().int().min(1).max(10),
  notes: z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscription: { select: { tier: true } } },
    });
    const cutoff = historyDateCutoff(user?.subscription?.tier);

    const ratings = await prisma.virtueRating.findMany({
      where: { userId: session.userId, ...(cutoff ? { createdAt: { gte: cutoff } } : {}) },
      orderBy: { weekKey: "desc" },
      take: 26,
    });

  const currentWeekKey = getWeekKey();
  const thisWeek = ratings.find((r) => r.weekKey === currentWeekKey) ?? null;

  return NextResponse.json({ success: true, thisWeek, history: ratings });
  } catch (err) {
    console.error("Virtues GET error:", err);
    return NextResponse.json({ success: false, thisWeek: null, history: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = virtueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });
  }

  const weekKey = getWeekKey();
  const rating = await prisma.virtueRating.upsert({
    where: { userId_weekKey: { userId: session.userId, weekKey } },
    create: { userId: session.userId, weekKey, ...parsed.data },
    update: { ...parsed.data },
  });

  return NextResponse.json({ success: true, rating });
}
