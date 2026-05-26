"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricBar } from "@/components/ui/ScoreVisuals";
import {
  Users, TrendingUp, CreditCard, Activity, ShieldAlert, BarChart3,
  Bitcoin, CheckCircle2, Clock, RefreshCw, Crown, Building2, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// ── types ──────────────────────────────────────────────────────────────────────

type AdminStats = {
  totalUsers: number;
  activeUsers30d: number;
  freeUsers: number;
  premiumUsers: number;
  enterpriseUsers: number;
  totalCalculations: number;
  totalAiReflections: number;
  totalSimulations: number;
  mrr: number;
  signupsByDay: Array<{ date: string; count: number }>;
  calculatorBreakdown: Array<{ type: string; count: number }>;
  avgScores: Record<string, number>;
};

type BtcInvoice = {
  id: string;
  plan: string;
  usdAmount: number;
  satoshis: number;
  btcAddress: string;
  status: "PENDING" | "MEMPOOL";
  expiresAt: string;
  createdAt: string;
  user: { email: string; name: string | null };
};

type WalletTopUp = {
  id: string;
  usdCents: number;
  satoshis: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED";
  btcAddress: string;
  expiresAt: string;
  createdAt: string;
  confirmedAt: string | null;
  adminNote: string | null;
  user: { email: string; name: string | null };
};

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
};

// ── constants ──────────────────────────────────────────────────────────────────

const PLAN_COLORS = ["#94A3B8", "#C9A84C", "#1C1917"];

const PLAN_LABELS: Record<string, string> = {
  premium_monthly:    "Premium Monthly",
  premium_annual:     "Premium Annual",
  enterprise_monthly: "Enterprise Monthly",
};

const TIER_ICON: Record<string, React.ReactNode> = {
  premium_monthly:    <Crown className="w-3.5 h-3.5 text-amber-500" />,
  premium_annual:     <Crown className="w-3.5 h-3.5 text-amber-500" />,
  enterprise_monthly: <Building2 className="w-3.5 h-3.5 text-stone-700" />,
};

function usdDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function expiresIn(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m left`;
  return `${Math.floor(m / 60)}h left`;
}

// ── tabs ───────────────────────────────────────────────────────────────────────

type Tab = "overview" | "payments";

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  // Overview
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Payments
  const [invoices, setInvoices] = useState<BtcInvoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pendingTopUps, setPendingTopUps] = useState<WalletTopUp[]>([]);
  const [recentTopUps, setRecentTopUps] = useState<WalletTopUp[]>([]);
  const [topUpsLoading, setTopUpsLoading] = useState(false);
  const [confirmingTopUpId, setConfirmingTopUpId] = useState<string | null>(null);
  const [rejectingTopUpId, setRejectingTopUpId] = useState<string | null>(null);

  // Subscription override
  const [overrideEmail, setOverrideEmail] = useState("");
  const [overrideTier, setOverrideTier] = useState<"FREE" | "PREMIUM" | "ENTERPRISE">("PREMIUM");
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") { router.push("/dashboard"); return; }
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) setStats(json.stats);
      else setStatsError(json.error || "Failed to load stats.");
    } catch {
      setStatsError("Could not reach admin API.");
    }
    setStatsLoading(false);
  };

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.success) {
        setInvoices(json.pendingInvoices);
        setPayments(json.recentPayments);
      } else {
        toast.error(json.error || "Failed to load payments.");
      }
    } catch {
      toast.error("Could not reach payments API.");
    }
    setPaymentsLoading(false);
  }, []);

  const fetchTopUps = useCallback(async () => {
    setTopUpsLoading(true);
    try {
      const res = await fetch("/api/admin/wallet/topups");
      const json = await res.json();
      if (json.success) {
        setPendingTopUps(json.pendingTopUps);
        setRecentTopUps(json.recentTopUps);
      } else {
        toast.error(json.error || "Failed to load wallet top-ups.");
      }
    } catch {
      toast.error("Could not reach wallet top-ups API.");
    }
    setTopUpsLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "payments") {
      fetchPayments();
      fetchTopUps();
    }
  }, [tab, fetchPayments, fetchTopUps]);

  const handleConfirm = async (invoiceId: string) => {
    setConfirmingId(invoiceId);
    try {
      const res = await fetch("/api/admin/bitcoin/force-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Payment activated — ${json.tier} subscription applied.`);
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
        fetchPayments();
      } else {
        toast.error(json.error || "Activation failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setConfirmingId(null);
  };

  const handleConfirmTopUp = async (topUpId: string) => {
    setConfirmingTopUpId(topUpId);
    try {
      const res = await fetch("/api/admin/wallet/confirm-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Wallet top-up confirmed.");
        fetchTopUps();
        fetchPayments();
      } else {
        toast.error(json.error || "Top-up confirmation failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setConfirmingTopUpId(null);
  };

  const handleRejectTopUp = async (topUpId: string) => {
    setRejectingTopUpId(topUpId);
    try {
      const res = await fetch("/api/admin/wallet/reject-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpId, adminNote: "Rejected from admin dashboard." }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Wallet top-up rejected.");
        fetchTopUps();
      } else {
        toast.error(json.error || "Top-up rejection failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setRejectingTopUpId(null);
  };

  const handleOverride = async () => {
    if (!overrideEmail.trim()) return toast.error("Enter an email address.");
    setOverriding(true);
    try {
      const res = await fetch("/api/admin/subscription/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: overrideEmail.trim(), tier: overrideTier }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${json.user.email} → ${overrideTier}`);
        setOverrideEmail("");
      } else {
        toast.error(json.error || "Override failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setOverriding(false);
  };

  // ── access guard ────────────────────────────────────────────────────────────

  if (user && user.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="font-semibold text-matte-black">Access Denied</p>
            <p className="text-sm text-slate-calm">Admin access only.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Admin Dashboard</h1>
            <p className="text-slate-calm text-sm">Platform health, payments, and account management.</p>
          </div>
          <button
            onClick={() => { fetchStats(); if (tab === "payments") fetchPayments(); }}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-slate-calm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit">
          {(["overview", "payments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? "bg-white text-matte-black shadow-sm" : "text-slate-calm hover:text-matte-black"
              }`}
            >
              {t === "payments" ? "Payments & Activation" : "Overview"}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <>
            {statsLoading && (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-soft-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {statsError && (
              <Card padding="lg" className="border-red-200 bg-red-50">
                <p className="text-sm text-red-600">{statsError}</p>
              </Card>
            )}

            {stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users",   value: stats.totalUsers,                   icon: <Users className="w-4 h-4 text-soft-gold" />,    sub: `${stats.activeUsers30d} active (30d)` },
                    { label: "MRR",           value: `$${stats.mrr.toLocaleString()}`,   icon: <CreditCard className="w-4 h-4 text-soft-gold" />, sub: `${stats.premiumUsers + stats.enterpriseUsers} paid` },
                    { label: "Calculations",  value: stats.totalCalculations,            icon: <BarChart3 className="w-4 h-4 text-soft-gold" />,  sub: `${stats.totalAiReflections} AI reflections` },
                    { label: "Simulations",   value: stats.totalSimulations,             icon: <Activity className="w-4 h-4 text-soft-gold" />,   sub: "Scenario runs total" },
                  ].map((kpi) => (
                    <Card key={kpi.label} padding="md">
                      <div className="flex items-center gap-2 mb-2">{kpi.icon}<span className="text-xs text-slate-calm font-medium">{kpi.label}</span></div>
                      <p className="text-xl font-bold text-matte-black font-serif">{kpi.value}</p>
                      <p className="text-xs text-slate-calm mt-0.5">{kpi.sub}</p>
                    </Card>
                  ))}
                </div>

                {stats.signupsByDay.length > 1 && (
                  <Card padding="lg">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-soft-gold" />
                        <CardTitle>Daily Signups (Last 30 Days)</CardTitle>
                      </div>
                    </CardHeader>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={stats.signupsByDay}>
                        <defs>
                          <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }} />
                        <Area type="monotone" dataKey="count" name="Signups" stroke="#C9A84C" fill="url(#signupGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <CardHeader>
                      <CardTitle>User Plan Distribution</CardTitle>
                      <CardDescription>Free vs Premium vs Enterprise</CardDescription>
                    </CardHeader>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Free",       value: stats.freeUsers },
                            { name: "Premium",    value: stats.premiumUsers },
                            { name: "Enterprise", value: stats.enterpriseUsers },
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          dataKey="value" paddingAngle={3}
                        >
                          {[0, 1, 2].map((i) => <Cell key={i} fill={PLAN_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [v, "users"]} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card padding="lg">
                    <CardHeader>
                      <CardTitle>Calculator Usage</CardTitle>
                      <CardDescription>Total runs per calculator type</CardDescription>
                    </CardHeader>
                    <div className="space-y-2.5 mt-2">
                      {stats.calculatorBreakdown.map((c) => (
                        <div key={c.type} className="flex items-center justify-between">
                          <span className="text-xs text-slate-calm w-40 truncate">{c.type.replace(/_/g, " ")}</span>
                          <div className="flex-1 mx-3">
                            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-soft-gold rounded-full"
                                style={{ width: `${Math.min(100, (c.count / Math.max(...stats.calculatorBreakdown.map((x) => x.count))) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-matte-black w-8 text-right">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {Object.keys(stats.avgScores).length > 0 && (
                  <Card padding="lg">
                    <CardHeader>
                      <CardTitle>Platform Average Scores</CardTitle>
                      <CardDescription>Mean score across all users per calculator</CardDescription>
                    </CardHeader>
                    <div className="space-y-2">
                      {Object.entries(stats.avgScores).map(([key, score]) => (
                        <MetricBar key={key} label={key.replace(/_/g, " ")} score={score} animate />
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* ── PAYMENTS TAB ──────────────────────────────────────────────────── */}
        {tab === "payments" && (
          <div className="space-y-6">

            {/* Wallet top-up requests */}
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-amber-500" />
                    <CardTitle>Wallet Top-Up Requests</CardTitle>
                  </div>
                  <button
                    onClick={fetchTopUps}
                    className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-slate-calm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${topUpsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <CardDescription>
                  Review wallet funding requests and confirm them once the BTC payment has been received.
                </CardDescription>
              </CardHeader>

              {topUpsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-soft-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!topUpsLoading && pendingTopUps.length === 0 && (
                <div className="text-center py-10 text-slate-calm">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm">No pending wallet top-ups.</p>
                  <p className="text-xs mt-1 text-stone-400">Users create these from Settings → Wallet.</p>
                </div>
              )}

              {!topUpsLoading && pendingTopUps.length > 0 && (
                <div className="space-y-2 mt-2">
                  {pendingTopUps.map((topUp) => (
                    <div
                      key={topUp.id}
                      className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-amber-50/40 p-4 lg:flex-row lg:items-center"
                    >
                      <div className="min-w-[180px]">
                        <p className="text-sm font-semibold text-matte-black">{topUp.user.email}</p>
                        <p className="text-xs text-slate-calm">{topUp.user.name || "Unnamed user"}</p>
                      </div>

                      <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-slate-calm font-semibold">USD Credit</p>
                          <p className="text-sm font-semibold text-matte-black">{usdDisplay(topUp.usdCents)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-slate-calm font-semibold">BTC Amount</p>
                          <p className="text-sm font-semibold text-matte-black">{(topUp.satoshis / 1e8).toFixed(6)} BTC</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-slate-calm font-semibold">Status</p>
                          <p className="text-sm font-semibold text-matte-black">{topUp.status}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-slate-calm font-semibold">Expires</p>
                          <p className="text-sm font-semibold text-matte-black">{expiresIn(topUp.expiresAt)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:w-[240px]">
                        <Button
                          variant="gold"
                          size="sm"
                          loading={confirmingTopUpId === topUp.id}
                          onClick={() => handleConfirmTopUp(topUp.id)}
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Confirm top-up
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={rejectingTopUpId === topUp.id}
                          onClick={() => handleRejectTopUp(topUp.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pending Bitcoin invoices */}
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-amber-500" />
                    <CardTitle>Pending Bitcoin Invoices</CardTitle>
                  </div>
                  <button
                    onClick={fetchPayments}
                    className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-slate-calm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${paymentsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <CardDescription>
                  Click <strong>Activate</strong> to confirm a payment and upgrade the user's subscription — no real BTC required in dev.
                </CardDescription>
              </CardHeader>

              {paymentsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-soft-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!paymentsLoading && invoices.length === 0 && (
                <div className="text-center py-10 text-slate-calm">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm">No pending invoices.</p>
                  <p className="text-xs mt-1 text-stone-400">
                    Go to <a href="/pricing" className="underline">Pricing</a> and click <em>Pay with Bitcoin</em> to create one.
                  </p>
                </div>
              )}

              {!paymentsLoading && invoices.length > 0 && (
                <div className="space-y-2 mt-2">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-stone-100 bg-amber-50/40 hover:bg-amber-50 transition-colors"
                    >
                      {/* Plan badge */}
                      <div className="flex items-center gap-2 min-w-[140px]">
                        {TIER_ICON[inv.plan] ?? <Zap className="w-3.5 h-3.5 text-stone-400" />}
                        <span className="text-xs font-semibold text-matte-black">
                          {PLAN_LABELS[inv.plan] || inv.plan}
                        </span>
                      </div>

                      {/* User */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-matte-black truncate">{inv.user.email}</p>
                        <p className="text-xs text-slate-calm">{inv.user.name}</p>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-matte-black">{usdDisplay(inv.usdAmount)}</p>
                        <p className="text-xs text-stone-400">{(inv.satoshis / 1e8).toFixed(6)} BTC</p>
                      </div>

                      {/* Status / expiry */}
                      <div className="text-right shrink-0 hidden sm:block">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          inv.status === "MEMPOOL"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-stone-100 text-slate-calm"
                        }`}>
                          {inv.status === "MEMPOOL" ? "In mempool" : "Waiting"}
                        </span>
                        <p className="text-xs text-stone-400 mt-0.5">{expiresIn(inv.expiresAt)}</p>
                      </div>

                      {/* Created */}
                      <p className="text-xs text-stone-400 shrink-0 hidden md:block">{timeAgo(inv.createdAt)}</p>

                      {/* Action */}
                      <Button
                        variant="gold"
                        size="sm"
                        loading={confirmingId === inv.id}
                        onClick={() => handleConfirm(inv.id)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Activate
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-amber-500" />
                    <CardTitle>Recent Wallet Top-Ups</CardTitle>
                  </div>
                  <button
                    onClick={fetchTopUps}
                    className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-slate-calm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${topUpsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <CardDescription>Confirmed, rejected, and expired wallet funding requests.</CardDescription>
              </CardHeader>

              {!topUpsLoading && recentTopUps.length === 0 && (
                <p className="text-sm text-slate-calm py-4 text-center">No wallet top-up history yet.</p>
              )}

              {recentTopUps.length > 0 && (
                <div className="space-y-1 mt-2">
                  {recentTopUps.map((topUp) => (
                    <div key={topUp.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        topUp.status === "CONFIRMED"
                          ? "bg-green-400"
                          : topUp.status === "PENDING"
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-matte-black truncate">{topUp.user.email}</p>
                        <p className="text-xs text-slate-calm truncate">{usdDisplay(topUp.usdCents)} · {topUp.status}</p>
                      </div>
                      <span className="text-xs text-stone-400 uppercase shrink-0">btc</span>
                      <span className="text-sm font-semibold text-matte-black shrink-0">{(topUp.satoshis / 1e8).toFixed(6)} BTC</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        topUp.status === "CONFIRMED" ? "bg-green-50 text-green-700" : "bg-stone-100 text-slate-calm"
                      }`}>{topUp.status}</span>
                      <span className="text-xs text-stone-400 shrink-0 hidden sm:block">{timeAgo(topUp.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Subscription override */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Set Subscription Tier</CardTitle>
                <CardDescription>Instantly change any user's plan — useful for demos, support, and testing.</CardDescription>
              </CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={overrideEmail}
                  onChange={(e) => setOverrideEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/40 focus:border-soft-gold bg-white"
                />
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value as typeof overrideTier)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-soft-gold/40 focus:border-soft-gold"
                >
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
                <Button variant="primary" size="sm" loading={overriding} onClick={handleOverride}>
                  Apply
                </Button>
              </div>
            </Card>

            {/* Recent payment history */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Recent Payment History</CardTitle>
                <CardDescription>Last 30 payments across Stripe and Bitcoin.</CardDescription>
              </CardHeader>
              {!paymentsLoading && payments.length === 0 && (
                <p className="text-sm text-slate-calm py-4 text-center">No payments yet.</p>
              )}
              {payments.length > 0 && (
                <div className="space-y-1 mt-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        p.status === "SUCCEEDED" ? "bg-green-400" : p.status === "PENDING" ? "bg-amber-400" : "bg-red-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-matte-black truncate">{p.user.email}</p>
                        <p className="text-xs text-slate-calm truncate">{p.description || "—"}</p>
                      </div>
                      <span className="text-xs text-stone-400 uppercase shrink-0">{p.currency}</span>
                      <span className="text-sm font-semibold text-matte-black shrink-0">{usdDisplay(p.amount)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        p.status === "SUCCEEDED" ? "bg-green-50 text-green-700" : "bg-stone-100 text-slate-calm"
                      }`}>{p.status}</span>
                      <span className="text-xs text-stone-400 shrink-0 hidden sm:block">{timeAgo(p.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
