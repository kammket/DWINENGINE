import { NextResponse } from "next/server";

// In-memory cache — avoids hammering CoinGecko on every page load
let cached: { price: number; at: number } | null = null;
const TTL_MS = 60_000; // 1 minute

export async function GET() {
  const now = Date.now();

  if (cached && now - cached.at < TTL_MS) {
    return NextResponse.json({ price: cached.price });
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const data = await res.json();
    const price: number = data?.bitcoin?.usd;

    if (!price) throw new Error("Unexpected CoinGecko response");

    cached = { price, at: now };
    return NextResponse.json({ price });
  } catch {
    // Return stale cache rather than failing completely
    if (cached) return NextResponse.json({ price: cached.price });
    return NextResponse.json({ price: null }, { status: 503 });
  }
}
