import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  context: z.string().min(1).max(3000).optional(),
  options: z.array(z.string().min(1).max(200)).min(1).max(8).optional(),
  decisionScore: z.number().min(0).max(100).nullable().optional(),
  chosenOption: z.string().max(200).nullable().optional(),
  outcome: z.string().max(3000).nullable().optional(),
  outcomeDate: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const entry = await prisma.decisionJournal.findFirst({
    where: { id, userId: session.userId },
  });
  if (!entry) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });
  }

  const updated = await prisma.decisionJournal.update({
    where: { id },
    data: {
      ...parsed.data,
      options: parsed.data.options as string[] | undefined,
      outcomeDate: parsed.data.outcomeDate ? new Date(parsed.data.outcomeDate) : parsed.data.outcomeDate,
    },
  });

  return NextResponse.json({ success: true, entry: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const entry = await prisma.decisionJournal.findFirst({
    where: { id, userId: session.userId },
  });
  if (!entry) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  await prisma.decisionJournal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
