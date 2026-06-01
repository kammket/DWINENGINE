import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);

  const [checkins, calcResults, journals, intentions] = await Promise.all([
    prisma.weeklyCheckin.findMany({
      where: { userId: session.userId, createdAt: { gte: cutoff } },
      select: { createdAt: true },
    }),
    prisma.calculatorResult.findMany({
      where: { userId: session.userId, createdAt: { gte: cutoff } },
      select: { createdAt: true },
    }),
    prisma.decisionJournal.findMany({
      where: { userId: session.userId, createdAt: { gte: cutoff } },
      select: { createdAt: true },
    }),
    prisma.morningIntention.findMany({
      where: { userId: session.userId, createdAt: { gte: cutoff } },
      select: { createdAt: true },
    }),
  ]);

  const activity: Record<string, number> = {};
  const addDate = (d: Date) => {
    const key = d.toISOString().slice(0, 10);
    activity[key] = (activity[key] ?? 0) + 1;
  };

  [...checkins, ...calcResults, ...journals, ...intentions].forEach((r) =>
    addDate(r.createdAt)
  );

  return NextResponse.json({ success: true, activity });
}
