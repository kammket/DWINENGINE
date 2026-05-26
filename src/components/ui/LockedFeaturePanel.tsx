"use client";

import Link from "next/link";
import { Crown, Lock, Zap, Building2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Tier = "FREE" | "PREMIUM" | "ENTERPRISE" | null | undefined;

interface Props {
  userTier: Tier;
  isGuest?: boolean;
  feature: string;
  description: string;
  requiredTier: "PREMIUM" | "ENTERPRISE";
  children?: React.ReactNode; // rendered when unlocked
}

export function LockedFeaturePanel({
  userTier,
  isGuest = false,
  feature,
  description,
  requiredTier,
  children,
}: Props) {
  const isUnlocked =
    requiredTier === "PREMIUM"
      ? userTier === "PREMIUM" || userTier === "ENTERPRISE"
      : userTier === "ENTERPRISE";

  if (isUnlocked) return <>{children}</>;

  const isPremiumRequired = requiredTier === "PREMIUM";

  return (
    <div className="mt-6 pt-6 border-t border-stone-100">
      <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            {isPremiumRequired ? (
              <Crown className="w-4 h-4 text-soft-gold" />
            ) : (
              <Building2 className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-matte-black">{feature}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                isPremiumRequired
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}>
                {isPremiumRequired ? <Crown className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                {requiredTier === "PREMIUM" ? "Premium" : "Enterprise"}
              </span>
              <Lock className="w-3 h-3 text-stone-300" />
            </div>
            <p className="text-xs text-slate-calm leading-relaxed mb-3">{description}</p>
            <Link href={isGuest ? "/onboarding" : "/pricing"}>
              <Button
                variant="gold"
                size="sm"
                icon={isGuest ? <ArrowRight className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                {isGuest
                  ? "Create free account first"
                  : isPremiumRequired
                  ? "Upgrade to Premium — $19/mo"
                  : "View Enterprise plans"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SimulatorPanelProps {
  userTier: Tier;
  isGuest?: boolean;
}

export function SimulatorLockedPanel({ userTier, isGuest = false }: SimulatorPanelProps) {
  return (
    <LockedFeaturePanel
      userTier={userTier}
      isGuest={isGuest}
      feature="Scenario Simulator"
      description="Model what happens to your scores under different life choices — job changes, financial decisions, lifestyle shifts — over a 12-month horizon."
      requiredTier="PREMIUM"
    >
      <Link href="/simulate">
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-slate-calm">
            <Zap className="w-3.5 h-3.5 text-soft-gold" />
            <span>Run a scenario simulation with this result as your baseline →</span>
          </div>
        </div>
      </Link>
    </LockedFeaturePanel>
  );
}
