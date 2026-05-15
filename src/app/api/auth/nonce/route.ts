import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateNonce, buildSignMessage } from "@/lib/walletNonce";
import { rateLimit } from "@/lib/auth";

const schema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`nonce:${ip}`, 10, 60_000)) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid address" }, { status: 400 });
  }

  const { address } = parsed.data;
  const nonce = generateNonce(address);
  const message = buildSignMessage(address, nonce);

  return NextResponse.json({ success: true, nonce, message });
}
