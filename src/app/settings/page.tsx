"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Lock, CreditCard, Trash2, Eye, EyeOff, CheckCircle, ExternalLink, AlertTriangle, Download, Key, Copy, Plus, X, Wallet, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

type Tab = "profile" | "security" | "subscription" | "wallet" | "data" | "api";

type ApiKeyRecord = { id: string; name: string; prefix: string; lastUsedAt: string | null; createdAt: string };
type WalletTopUp = { id: string; usdCents: number; status: string; expiresAt: string };
type WalletTopUpDetails = WalletTopUp & { btcAddress: string; satoshis: number; confirmedAt: string | null; adminNote: string | null };
type WalletResponse = {
  success: boolean;
  wallet: { id: string; balanceCents: number; autoRenewPlan: string | null; autoRenewEnabled: boolean };
  pendingTopUp: WalletTopUp | null;
  subscription: { tier: string; status: string; currentPeriodEnd: string | null } | null;
  planCosts: Record<string, number>;
};

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [philosopherGuide, setPhilosopherGuide] = useState<string>(
    (user as { profile?: { philosopherGuide?: string } } | undefined)?.profile?.philosopherGuide || "marcus"
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // API keys (Enterprise)
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [apiKeysLoaded, setApiKeysLoaded] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [exportingData, setExportingData] = useState(false);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletSaving, setWalletSaving] = useState(false);
  const [creatingTopUp, setCreatingTopUp] = useState(false);
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState(5000);
  const [topUpDetails, setTopUpDetails] = useState<WalletTopUpDetails | null>(null);
  const [selectedAutoRenewPlan, setSelectedAutoRenewPlan] = useState<string>("premium_monthly");
  const [selectedAutoRenewEnabled, setSelectedAutoRenewEnabled] = useState(true);

  const isPremium = user?.subscription?.tier === "PREMIUM" || user?.subscription?.tier === "ENTERPRISE";
  const isEnterprise = user?.subscription?.tier === "ENTERPRISE";

  const loadApiKeys = async () => {
    if (apiKeysLoaded) return;
    try {
      const res = await fetch("/api/keys");
      const json = await res.json();
      if (json.success) setApiKeys(json.keys);
    } catch { /* silent */ }
    setApiKeysLoaded(true);
  };

  const loadWallet = async (force = false) => {
    if (walletLoaded && !force) return;
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet");
      const json: WalletResponse = await res.json();
      if (json.success) {
        setWalletData(json);
        setSelectedAutoRenewPlan(json.wallet.autoRenewPlan || "premium_monthly");
        setSelectedAutoRenewEnabled(json.wallet.autoRenewEnabled);

        if (json.pendingTopUp) {
          const detailRes = await fetch(`/api/wallet/topup/${json.pendingTopUp.id}`);
          const detailJson = await detailRes.json();
          if (detailJson.success) {
            setTopUpDetails(detailJson.topUp);
          } else {
            setTopUpDetails(null);
          }
        } else {
          setTopUpDetails(null);
        }

        setWalletLoaded(true);
      } else {
        toast.error((json as { error?: string }).error || "Failed to load wallet.");
      }
    } catch {
      toast.error("Failed to load wallet.");
    }
    setWalletLoading(false);
  };

  const handleCreateTopUp = async () => {
    setCreatingTopUp(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usdCents: selectedTopUpAmount }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Top-up request created.");
        await loadWallet(true);
        setTab("wallet");
      } else if (json.topUpId) {
        toast.error("You already have a pending top-up.");
        await loadWallet(true);
        setTab("wallet");
      } else {
        toast.error(json.error || "Failed to create top-up.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setCreatingTopUp(false);
  };

  const handleSaveWalletSettings = async () => {
    setWalletSaving(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoRenewPlan: selectedAutoRenewEnabled ? selectedAutoRenewPlan : null,
          autoRenewEnabled: selectedAutoRenewEnabled,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Wallet settings saved.");
        await loadWallet(true);
      } else {
        toast.error(json.error || "Could not save wallet settings.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setWalletSaving(false);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setRevealedKey(json.rawKey);
        setApiKeys((prev) => [json.key, ...prev]);
        setNewKeyName("");
        toast.success("API key created — copy it now, it won't be shown again.");
      } else {
        toast.error(json.error || "Failed to create key.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setCreatingKey(false);
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        toast.success("Key revoked.");
      } else {
        toast.error(json.error || "Failed to revoke key.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const handleExport = async (dataset: string, format: "csv" | "json") => {
    setExportingData(true);
    try {
      const res = await fetch(`/api/export?dataset=${dataset}&format=${format}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.upgradeRequired) {
          toast.error("Data export requires a Premium subscription.");
        } else {
          toast.error("Export failed. Please try again.");
        }
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `constavita-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded.");
    } catch {
      toast.error("Export failed.");
    } finally {
      setExportingData(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty.");
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, philosopherGuide }),
      });
      const json = await res.json();
      if (json.success) {
        await refreshUser();
        toast.success("Profile updated.");
      } else {
        toast.error(json.error || "Update failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error("All fields are required.");
    if (newPw !== confirmPw) return toast.error("New passwords do not match.");
    if (newPw.length < 8) return toast.error("Password must be at least 8 characters.");
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Password changed successfully.");
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        toast.error(json.error || "Password change failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setSavingPw(false);
  };

  const handleManageSubscription = async () => {
    setTab("wallet");
    toast("Billing is managed through wallet funding and auto-renew settings.", { icon: "₿" });
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== user?.email) return toast.error("Email does not match.");
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Account deleted.");
        await logout();
        window.location.href = "/";
      } else {
        toast.error(json.error || "Deletion failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setDeletingAccount(false);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    { id: "subscription", label: "Subscription", icon: <CreditCard className="w-4 h-4" /> },
    { id: "wallet", label: "Wallet", icon: <Wallet className="w-4 h-4" /> },
    { id: "data", label: "Data & Privacy", icon: <Trash2 className="w-4 h-4" /> },
    ...(isEnterprise ? [{ id: "api" as Tab, label: "API Keys", icon: <Key className="w-4 h-4" /> }] : []),
  ];

  useEffect(() => {
    if (tab === "wallet") {
      void loadWallet();
    }
  }, [tab]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Settings</h1>
          <p className="text-slate-calm text-sm">Manage your account, security, and subscription.</p>
        </motion.div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all ${
                tab === t.id ? "bg-white text-matte-black shadow-sm" : "text-slate-calm hover:text-matte-black"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your display name.</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-matte-black mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input-field bg-stone-50 text-stone-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-calm mt-1">Email address cannot be changed.</p>
                </div>

                {/* Philosopher Guide */}
                <div>
                  <label className="block text-sm font-medium text-matte-black mb-1">
                    Stoic Guide
                  </label>
                  <p className="text-xs text-slate-calm mb-3">
                    Your AI reflections will be styled in the voice of your chosen philosopher.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: "marcus",
                        name: "Marcus Aurelius",
                        role: "Emperor · Soldier",
                        tone: "Kingly, self-critical, duty-focused",
                        emoji: "👑",
                      },
                      {
                        key: "epictetus",
                        name: "Epictetus",
                        role: "Former slave · Teacher",
                        tone: "Sharp, direct, freedom-focused",
                        emoji: "⚡",
                      },
                      {
                        key: "seneca",
                        name: "Seneca",
                        role: "Statesman · Writer",
                        tone: "Warm, literary, time-focused",
                        emoji: "✍️",
                      },
                    ].map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPhilosopherGuide(p.key)}
                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                          philosopherGuide === p.key
                            ? "bg-amber-50 border-soft-gold shadow-gold"
                            : "bg-white border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <span className="text-xl mb-1">{p.emoji}</span>
                        <p className="text-xs font-bold text-matte-black leading-tight">{p.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">{p.role}</p>
                        <p className="text-[10px] text-stone-500 mt-1.5 leading-tight italic">{p.tone}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button variant="primary" loading={savingProfile} onClick={handleSaveProfile} icon={<CheckCircle className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Security Tab */}
        {tab === "security" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Use a strong, unique password of at least 8 characters.</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-calm hover:text-matte-black"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-matte-black mb-1">New Password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="input-field"
                    placeholder="New password"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-matte-black mb-1">Confirm New Password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="input-field"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
                <Button variant="primary" loading={savingPw} onClick={handleChangePassword} icon={<Lock className="w-4 h-4" />}>
                  Update Password
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Subscription Tab */}
        {tab === "subscription" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription and billing.</CardDescription>
              </CardHeader>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200 mb-4">
                <div>
                  <p className="font-semibold text-matte-black capitalize">
                    {user?.subscription?.tier?.toLowerCase() || "Free"} Plan
                  </p>
                  <p className="text-xs text-slate-calm mt-0.5">
                    {user?.subscription?.tier === "FREE"
                      ? "Calculators & journal · Upgrade for AI"
                      : user?.subscription?.tier === "PREMIUM"
                      ? "Unlimited AI · Simulator · Analytics"
                      : "All features + dedicated support"}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  user?.subscription?.tier === "FREE"
                    ? "bg-stone-200 text-stone-600"
                    : user?.subscription?.tier === "PREMIUM"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-800 text-white"
                }`}>
                  {user?.subscription?.tier || "FREE"}
                </span>
              </div>

              {user?.subscription?.tier === "FREE" ? (
                <Link href="/pricing">
                  <Button variant="gold" fullWidth icon={<ExternalLink className="w-4 h-4" />}>
                    Upgrade to Premium
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" fullWidth icon={<ExternalLink className="w-4 h-4" />} onClick={handleManageSubscription}>
                  Manage Billing in Wallet
                </Button>
              )}
              <p className="text-xs text-slate-calm mt-4 leading-relaxed">
                Wallet balance is managed in the Wallet tab and is applied to subscription renewals when auto-renew is enabled.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Wallet Tab */}
        {tab === "wallet" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Wallet Balance</CardTitle>
                    <CardDescription>Use your wallet balance to pay for subscription renewals automatically.</CardDescription>
                  </div>
                  <Button variant="secondary" size="sm" loading={walletLoading} onClick={() => void loadWallet(true)} icon={<RefreshCw className="w-4 h-4" />}>
                    Refresh
                  </Button>
                </div>
              </CardHeader>

              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                  <p className="text-xs uppercase tracking-widest text-slate-calm font-semibold">Available Balance</p>
                  <p className="mt-2 text-3xl font-serif font-bold text-matte-black">
                    ${((walletData?.wallet.balanceCents ?? 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-calm mt-1">
                    This balance is deducted before a renewal is charged elsewhere.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                  <p className="text-xs uppercase tracking-widest text-slate-calm font-semibold">Auto-Renew</p>
                  <p className="mt-2 text-sm font-medium text-matte-black">
                    {walletData?.wallet.autoRenewEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="text-xs text-slate-calm mt-1">
                    Plan: {walletData?.wallet.autoRenewPlan || "No plan selected"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[2000, 5000, 10000, 20000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setSelectedTopUpAmount(amount)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                        selectedTopUpAmount === amount
                          ? "border-soft-gold bg-amber-50 text-matte-black shadow-gold"
                          : "border-stone-200 bg-white text-slate-calm hover:border-stone-300 hover:text-matte-black"
                      }`}
                    >
                      ${amount / 100}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-stone-200 bg-white">
                  <div>
                    <p className="font-semibold text-matte-black">Create a top-up request</p>
                    <p className="text-xs text-slate-calm mt-1">
                      Generate a BTC payment request for ${selectedTopUpAmount / 100}. The credit will appear here after confirmation.
                    </p>
                  </div>
                  <Button variant="gold" loading={creatingTopUp} onClick={handleCreateTopUp} icon={<Plus className="w-4 h-4" />}>
                    Top up wallet
                  </Button>
                </div>

                {topUpDetails ? (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-matte-black">Pending top-up</p>
                        <p className="text-xs text-slate-calm">Pay the exact BTC amount below to fund your wallet.</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                        {topUpDetails.status}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-calm font-semibold">BTC Amount</p>
                        <p className="mt-1 font-medium text-matte-black">{(topUpDetails.satoshis / 100_000_000).toFixed(8)} BTC</p>
                        <p className="text-xs text-slate-calm mt-0.5">{topUpDetails.satoshis.toLocaleString()} sats</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-calm font-semibold">USD Credit</p>
                        <p className="mt-1 font-medium text-matte-black">${(topUpDetails.usdCents / 100).toFixed(2)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-calm font-semibold mb-1">Payment Address</p>
                      <div className="flex items-start gap-2">
                        <code className="flex-1 text-xs font-mono bg-white border border-amber-200 rounded-xl px-3 py-2 break-all text-matte-black">
                          {topUpDetails.btcAddress}
                        </code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(topUpDetails.btcAddress).then(() => toast.success("Address copied."))}
                          className="p-2 rounded-xl border border-amber-200 bg-white hover:bg-amber-100 transition-colors"
                        >
                          <Copy className="w-4 h-4 text-amber-700" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-calm">
                      Expires {new Date(topUpDetails.expiresAt).toLocaleString()}.
                    </p>
                  </div>
                ) : walletData?.pendingTopUp ? (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50">
                    <p className="text-sm font-semibold text-matte-black">Pending top-up</p>
                    <p className="text-xs text-slate-calm mt-1">
                      ${walletData.pendingTopUp.usdCents / 100} is awaiting BTC payment and confirmation.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                    <p className="text-sm font-semibold text-matte-black">No active top-up request</p>
                    <p className="text-xs text-slate-calm mt-1">Create a request above to pre-fund your wallet for future renewals.</p>
                  </div>
                )}

                <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
                  <div>
                    <p className="font-semibold text-matte-black">Auto-renew settings</p>
                    <p className="text-xs text-slate-calm mt-1">Choose which plan your wallet should renew and whether it should do so automatically.</p>
                  </div>

                  <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
                    <span className="text-sm font-medium text-matte-black">Enable auto-renew</span>
                    <input
                      type="checkbox"
                      checked={selectedAutoRenewEnabled}
                      onChange={(e) => setSelectedAutoRenewEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-soft-gold focus:ring-soft-gold"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-matte-black mb-1">Renewal plan</label>
                    <select
                      value={selectedAutoRenewPlan}
                      onChange={(e) => setSelectedAutoRenewPlan(e.target.value)}
                      className="input-field"
                      disabled={!selectedAutoRenewEnabled}
                    >
                      <option value="premium_monthly">Premium Monthly - ${(walletData?.planCosts.premium_monthly ?? 1900) / 100}</option>
                      <option value="premium_annual">Premium Annual - ${(walletData?.planCosts.premium_annual ?? 15900) / 100}</option>
                      <option value="enterprise_monthly">Enterprise Monthly - ${(walletData?.planCosts.enterprise_monthly ?? 9900) / 100}</option>
                    </select>
                  </div>

                  <Button variant="primary" loading={walletSaving} onClick={handleSaveWalletSettings} icon={<CheckCircle className="w-4 h-4" />}>
                    Save Wallet Settings
                  </Button>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle>How wallet funding works</CardTitle>
                <CardDescription>Wallet credits are a pre-funded balance for future renewals.</CardDescription>
              </CardHeader>
              <ul className="space-y-2 text-sm text-slate-calm leading-relaxed list-disc pl-5">
                <li>Top up the wallet once, then let the balance cover your next renewal.</li>
                <li>If auto-renew is on, the wallet is used before any new checkout is needed.</li>
                <li>You can change the renewal plan or disable auto-renew at any time.</li>
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Data & Privacy Tab */}
        {tab === "data" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Your Data</CardTitle>
                <CardDescription>Your data is private and never sold to third parties.</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                <p className="text-sm text-slate-calm leading-relaxed">
                  All calculator inputs, scores, and AI reflections are stored securely on our servers
                  and are accessible only to you. We comply with GDPR and CCPA data regulations.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/legal/privacy">
                    <Button variant="secondary" size="sm">Privacy Policy</Button>
                  </Link>
                  <Link href="/legal/gdpr">
                    <Button variant="secondary" size="sm">GDPR Rights</Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Export Data */}
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-soft-gold" />
                  <CardTitle>Export Your Data</CardTitle>
                </div>
                <CardDescription>
                  {isPremium
                    ? "Download your full history as CSV or JSON."
                    : "Available on Premium and Enterprise plans."}
                </CardDescription>
              </CardHeader>
              {isPremium ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "All Data", dataset: "all" },
                      { label: "Calculator Results", dataset: "calculators" },
                      { label: "Decision Journal", dataset: "journal" },
                      { label: "Weekly Check-ins", dataset: "checkins" },
                    ].map(({ label, dataset }) => (
                      <div key={dataset} className="flex flex-col gap-1.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-xs font-semibold text-matte-black">{label}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleExport(dataset, "csv")}
                            disabled={exportingData}
                            className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-stone-200 bg-white hover:border-soft-gold hover:text-soft-gold transition-colors disabled:opacity-50"
                          >
                            CSV
                          </button>
                          <button
                            onClick={() => handleExport(dataset, "json")}
                            disabled={exportingData}
                            className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-stone-200 bg-white hover:border-soft-gold hover:text-soft-gold transition-colors disabled:opacity-50"
                          >
                            JSON
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {exportingData && (
                    <p className="text-xs text-slate-calm flex items-center gap-2">
                      <span className="w-3 h-3 border border-soft-gold border-t-transparent rounded-full animate-spin inline-block" />
                      Preparing export…
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-slate-calm">Upgrade to export your full history as CSV or JSON.</p>
                  <Link href="/pricing">
                    <Button variant="gold" size="sm">Upgrade</Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card padding="lg" className="border-red-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <CardTitle className="text-red-600">Delete Account</CardTitle>
                </div>
                <CardDescription>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-matte-black mb-1">
                    Type your email to confirm: <span className="font-mono text-red-600">{user?.email}</span>
                  </label>
                  <input
                    type="email"
                    value={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.value)}
                    className="input-field border-red-200 focus:border-red-400"
                    placeholder={user?.email || ""}
                  />
                </div>
                <Button
                  variant="danger"
                  loading={deletingAccount}
                  disabled={confirmDelete !== user?.email}
                  onClick={handleDeleteAccount}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Permanently Delete Account
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        {/* API Keys Tab — Enterprise only */}
        {tab === "api" && isEnterprise && (() => { if (!apiKeysLoaded) loadApiKeys(); return null; })()}
        {tab === "api" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-soft-gold" />
                  <CardTitle>API Keys</CardTitle>
                </div>
                <CardDescription>
                  Generate keys to authenticate requests to the Constavita API. Each key is shown once — store it securely.
                </CardDescription>
              </CardHeader>

              {/* Create new key */}
              <form onSubmit={handleCreateKey} className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name e.g. Production Integration"
                  className="input-field flex-1 text-sm"
                  maxLength={80}
                />
                <Button type="submit" variant="gold" size="sm" loading={creatingKey} icon={<Plus className="w-4 h-4" />}>
                  Create
                </Button>
              </form>

              {/* Revealed key banner */}
              {revealedKey && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Copy your key now — it will not be shown again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono bg-white border border-amber-200 rounded-lg px-3 py-2 text-matte-black break-all">
                      {revealedKey}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(revealedKey); toast.success("Copied!"); }}
                      className="p-2 rounded-lg border border-amber-200 bg-white hover:bg-amber-100 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-amber-700" />
                    </button>
                    <button onClick={() => setRevealedKey(null)} className="p-2 rounded-lg border border-amber-200 bg-white hover:bg-amber-100 transition-colors">
                      <X className="w-4 h-4 text-amber-700" />
                    </button>
                  </div>
                </div>
              )}

              {/* Keys list */}
              {apiKeys.length === 0 ? (
                <p className="text-sm text-slate-calm text-center py-6">No active keys. Create one above.</p>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-matte-black truncate">{key.name}</p>
                        <p className="text-xs text-slate-calm font-mono">
                          {key.prefix}••••••••••••••••••••
                          {key.lastUsedAt && (
                            <span className="ml-2 non-mono not-italic">· last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="ml-3 flex-shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Revoke key"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-calm leading-relaxed">
              Send your API key in the <code className="font-mono bg-white px-1 rounded">Authorization: Bearer &lt;key&gt;</code> header.
              Keys inherit Enterprise-tier permissions and count against your rate limits.
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
