import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { historyDateCutoff } from "@/lib/tier";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  context: z.string().min(1).max(3000),
  options: z.array(z.string().min(1).max(200)).min(1).max(8),
  decisionScore: z.number().min(0).max(100).optional(),
  chosenOption: z.string().max(200).optional(),
  controlCategory: z.enum(["in_control", "partial", "outside_control"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscription: { select: { tier: true } } },
  });
  const cutoff = historyDateCutoff(user?.subscription?.tier);
  const dateFilter = cutoff ? { createdAt: { gte: cutoff } } : {};

  const [entries, total] = await Promise.all([
    prisma.decisionJournal.findMany({
      where: { userId: session.userId, ...dateFilter },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.decisionJournal.count({ where: { userId: session.userId, ...dateFilter } }),
  ]);

  return NextResponse.json({ success: true, entries, total });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const entry = await prisma.decisionJournal.create({
    data: {
      userId: session.userId,
      ...parsed.data,
      options: parsed.data.options as string[],
    },
  });

  return NextResponse.json({ success: true, entry }, { status: 201 });
}
