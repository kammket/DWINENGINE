import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  topUpId: z.string().min(1),
  adminNote: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "topUpId is required." }, { status: 400 });
  }

  const topUp = await prisma.bitcoinTopUp.findUnique({ where: { id: parsed.data.topUpId } });
  if (!topUp) {
    return NextResponse.json({ success: false, error: "Top-up not found." }, { status: 404 });
  }
  if (topUp.status !== "PENDING") {
    return NextResponse.json({ success: false, error: `Cannot reject a ${topUp.status} top-up.` }, { status: 409 });
  }

  await prisma.bitcoinTopUp.update({
    where: { id: topUp.id },
    data: { status: "REJECTED", adminNote: parsed.data.adminNote ?? null },
  });

  return NextResponse.json({ success: true, message: "Top-up rejected.", topUpId: topUp.id });
}
