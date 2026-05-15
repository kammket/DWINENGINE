"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Check, Zap, Crown, Building2, ArrowRight, Bitcoin, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import toast from "react-hot-toast";

type BillingPeriod = "monthly" | "annual";

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: <Zap className="w-5 h-5" />,
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Begin your Stoic self-awareness journey with our core tools.",
    cta: "Get Started Free",
    priceId: null,
    features: [
      "All 5 calculators (unlimited)",
      "Basic assessment dashboard",
      "Decision Journal & Morning Intention",
      "30-day score history",
      "Email support",
    ],
    missing: ["AI reflections (Logos)", "Scenario Simulator", "Advanced analytics", "Priority support", "API access"],
  },
  {
    id: "premium",
    name: "Premium",
    icon: <Crown className="w-5 h-5" />,
    monthlyPrice: 19,
    annualPrice: 159,
    annualSaving: "Save $69",
    description: "Unlock the full intelligence platform for serious personal growth.",
    cta: "Upgrade to Premium",
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
      annual: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ANNUAL_PRICE_ID || "price_premium_annual",
    },
    popular: true,
    features: [
      "Everything in Free",
      "Unlimited AI reflections (Logos)",
      "Scenario Simulator (12-month projections)",
      "Advanced analytics & trend charts",
      "Longitudinal assessment history",
      "Priority email support",
      "Export your data (PDF/CSV)",
    ],
    missing: ["Dedicated success manager", "Custom integrations", "Team dashboards"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: <Building2 className="w-5 h-5" />,
    monthlyPrice: 99,
    annualPrice: 840,
    annualSaving: "Save $348",
    description: "For executives, coaches, and teams who demand the highest level of clarity.",
    cta: "Start Enterprise",
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_enterprise_monthly",
      annual: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || "price_enterprise_annual",
    },
    features: [
      "Everything in Premium",
      "Dedicated success manager",
      "Custom AI persona configuration",
      "Team dashboards & shared reports",
      "API access for integrations",
      "SSO & enhanced security",
      "SLA-backed uptime guarantee",
      "Quarterly strategy review calls",
    ],
    missing: [],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingBtcPlan, setLoadingBtcPlan] = useState<string | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  // Fetch live BTC price via our server-side proxy (avoids CSP + rate limits)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("/api/btc-price");
        const data = await res.json();
        if (data?.price) setBtcPrice(data.price);
      } catch {
        // silent — non-critical
      }
    };
    fetchPrice();
    const id = setInterval(fetchPrice, 120_000);
    return () => clearInterval(id);
  }, []);

  const handlePayWithBitcoin = async (plan: typeof PLANS[0]) => {
    if (!plan.priceId) return;
    if (!user) {
      window.location.href = "/register?plan=" + plan.id + "&pay=btc";
      return;
    }
    const btcPlan =
      plan.id === "enterprise"
        ? "enterprise_monthly"
        : billing === "annual"
        ? "premium_annual"
        : "premium_monthly";

    setLoadingBtcPlan(plan.id);
    try {
      const res = await fetch("/api/payments/bitcoin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: btcPlan }),
      });
      const json = await res.json();
      if (json.invoiceId) {
        window.location.href = `/pay/bitcoin/${json.invoiceId}`;
      } else {
        toast.error(json.error || "Bitcoin payments not available yet.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setLoadingBtcPlan(null);
  };

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (!plan.priceId) {
      // Free plan — sign up or go to dashboard
      if (user) window.location.href = "/dashboard";
      else window.location.href = "/register";
      return;
    }

    if (!user) {
      window.location.href = "/register?plan=" + plan.id;
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const priceId = billing === "annual" ? plan.priceId.annual : plan.priceId.monthly;
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId: plan.id }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        toast.error(json.error || "Failed to start checkout.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setLoadingPlan(null);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="text-center px-4 mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-matte-black mb-4">
              Invest in Your{" "}
              <span className="gradient-text">Decision Intelligence</span>
            </h1>
            <p className="text-slate-calm text-lg max-w-xl mx-auto mb-8">
              Choose the plan that matches your commitment to Stoic clarity and measurable personal growth.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex bg-white rounded-xl p-1 border border-stone-200 shadow-sm">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                  billing === "monthly" ? "bg-matte-black text-warm-white" : "text-slate-calm hover:text-matte-black"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  billing === "annual" ? "bg-matte-black text-warm-white" : "text-slate-calm hover:text-matte-black"
                }`}
              >
                Annual
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Save up to 30%</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Bitcoin banner */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-6xl mx-auto px-4 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Bitcoin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Pay with Bitcoin — 0% fees, instant activation</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Every plan supports direct on-chain Bitcoin payment. No processor, no markup, no account required.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">
                Live BTC price:{" "}
                {btcPrice
                  ? `$${btcPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : "Loading…"}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Plans */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-soft-gold text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">Most Popular</span>
                  </div>
                )}
                <div className={`h-full bg-white rounded-2xl border-2 p-7 flex flex-col shadow-sm transition-shadow hover:shadow-md ${
                  plan.popular ? "border-soft-gold" : "border-stone-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={plan.popular ? "text-soft-gold" : "text-matte-black"}>{plan.icon}</span>
                    <h2 className="font-serif text-xl font-bold text-matte-black">{plan.name}</h2>
                  </div>

                  <div className="mb-3">
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-3xl font-bold text-matte-black">Free</span>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-matte-black">
                            ${billing === "annual" ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice}
                          </span>
                          <span className="text-slate-calm text-sm">/mo</span>
                          {billing === "annual" && plan.annualSaving && (
                            <span className="ml-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              {plan.annualSaving}
                            </span>
                          )}
                        </div>
                        {billing === "annual" && (
                          <p className="text-xs text-slate-calm mt-0.5">
                            ${plan.annualPrice}/year billed annually
                          </p>
                        )}
                        {btcPrice && (
                          <div className="flex items-center gap-1 mt-1">
                            <Bitcoin className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-700 font-medium">
                              ≈ {((billing === "annual" ? plan.annualPrice : plan.monthlyPrice) / btcPrice).toFixed(5)} BTC
                            </span>
                            <span className="text-xs text-stone-400">
                              ({billing === "annual" ? "per year" : "per month"})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-calm mb-5 leading-relaxed">{plan.description}</p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-matte-black">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-stone-400 line-through">
                        <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-300">✕</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "gold" : plan.id === "enterprise" ? "primary" : "secondary"}
                    fullWidth
                    size="md"
                    loading={loadingPlan === plan.id}
                    onClick={() => handleSubscribe(plan)}
                    icon={plan.id !== "free" ? <ArrowRight className="w-4 h-4" /> : undefined}
                    iconPosition="right"
                  >
                    {plan.cta}
                  </Button>

                  {/* Bitcoin payment option for paid plans */}
                  {plan.priceId && (
                    <button
                      onClick={() => handlePayWithBitcoin(plan)}
                      disabled={loadingBtcPlan === plan.id}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-all text-sm font-semibold text-amber-800 disabled:opacity-50 group"
                    >
                      {loadingBtcPlan === plan.id ? (
                        <span className="inline-block w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Bitcoin className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                      )}
                      Pay with Bitcoin
                      <span className="text-xs font-normal text-amber-600 ml-0.5">
                        {btcPrice && plan.monthlyPrice
                          ? `≈ ${((billing === "annual" ? plan.annualPrice : plan.monthlyPrice) / btcPrice).toFixed(6)} BTC`
                          : "0% fees"}
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-4 mt-20">
          <h2 className="font-serif text-2xl font-bold text-matte-black text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "Is my data private?",
                a: "Yes. Your inputs, scores, and AI reflections are stored securely and never shared or sold. Only you can see your results. You can delete your account and all data at any time.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your settings page at any time. You keep access until the end of your billing period, then revert to Free automatically.",
              },
              {
                q: "Is this AI-generated advice?",
                a: "No. Constavita provides educational indices for self-reflection, not medical, financial, legal, or psychological advice. Logos (our AI) reflects Stoic philosophy, but always consult qualified professionals for major life decisions.",
              },
              {
                q: "What payment methods do you accept?",
                a: "All major credit and debit cards via Stripe (Apple Pay and Google Pay where supported), plus direct Bitcoin (on-chain) with zero processing fees.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes. If you are unsatisfied within 7 days of your first payment, contact us for a full refund, no questions asked.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-stone-200">
                <p className="font-semibold text-matte-black mb-2 text-sm">{item.q}</p>
                <p className="text-sm text-slate-calm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-16 px-4">
          <p className="text-sm text-slate-calm italic font-serif max-w-sm mx-auto mb-6">
            &ldquo;First say to yourself what you would be, and then do what you have to do.&rdquo; — Epictetus
          </p>
          <Link href="/register">
            <Button variant="gold" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Start Free Today
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
