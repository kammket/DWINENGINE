"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Lock, CreditCard, Trash2, Eye, EyeOff, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

type Tab = "profile" | "security" | "subscription" | "data";

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
                      ? "3 AI reflections/month · No simulator"
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
      </div>
    </DashboardLayout>
  );
}
