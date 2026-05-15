import type { SubscriptionTier } from "@prisma/client";
import { NextResponse } from "next/server";

/** Date cutoff for history queries based on tier. Returns null = unlimited. */
export function historyDateCutoff(tier: SubscriptionTier | undefined | null): Date | null {
  if (!tier || tier === "FREE") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
  if (tier === "PREMIUM") {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }
  return null; // ENTERPRISE — unlimited
}

/** Returns true if tier meets the minimum required tier. */
export function meetsMinTier(
  tier: SubscriptionTier | undefined | null,
  min: "PREMIUM" | "ENTERPRISE"
): boolean {
  if (min === "ENTERPRISE") return tier === "ENTERPRISE";
  return tier === "PREMIUM" || tier === "ENTERPRISE";
}

/** Returns a 402 NextResponse if the tier doesn't meet the minimum. */
export function tierGate(
  tier: SubscriptionTier | undefined | null,
  min: "PREMIUM" | "ENTERPRISE",
  feature = "This feature"
): NextResponse | null {
  if (meetsMinTier(tier, min)) return null;
  const label = min === "ENTERPRISE" ? "Enterprise" : "Premium";
  return NextResponse.json(
    { success: false, error: `${feature} requires a ${label} subscription.`, upgradeRequired: true },
    { status: 402 }
  );
}
