"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Lock, CreditCard, Trash2, Eye, EyeOff, CheckCircle, ExternalLink, AlertTriangle, Download, Key, Copy, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

type Tab = "profile" | "security" | "subscription" | "data" | "api";

type ApiKeyRecord = { id: string; name: string; prefix: string; lastUsedAt: string | null; createdAt: string };

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
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal: true }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else toast.error("Could not open billing portal.");
    } catch {
      toast.error("Something went wrong.");
    }
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
    { id: "data", label: "Data & Privacy", icon: <Trash2 className="w-4 h-4" /> },
    ...(isEnterprise ? [{ id: "api" as Tab, label: "API Keys", icon: <Key className="w-4 h-4" /> }] : []),
  ];

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
                  Manage Billing & Cancel
                </Button>
              )}
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
