"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DailyReflection } from "@/components/ui/DailyReflection";
import { getDailyReflection } from "@/lib/stoic";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Wallet } from "lucide-react";
import toast from "react-hot-toast";

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[0-9]/, label: "One number" },
];

function MetaMaskIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 212 189" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="204.5,0.5 113.5,65.5 131,28" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
      <polygon points="7.5,0.5 97.9,66.1 81,28" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
      <polygon points="173,133.5 147.5,172.5 199,186.5 213.5,134.5" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
      <polygon points="0,134.5 14.5,186.5 66,172.5 40.5,133.5" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
      <polygon points="63,90.5 49,111.5 101,113.5 98.5,58" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
      <polygon points="149,90.5 114,57.5 113.5,113.5 165,111.5" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
      <polygon points="66,172.5 97,158 70.5,135" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
      <polygon points="115,158 147,172.5 141.5,135" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    </svg>
  );
}

async function connectMetaMask(): Promise<string> {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
  if (!accounts[0]) throw new Error("No account selected");
  return accounts[0];
}

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  // Wallet registration state — set when redirected from login with ?wallet=
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletNonce, setWalletNonce] = useState<string>("");
  const [walletSignature, setWalletSignature] = useState<string>("");
  const [walletStep, setWalletStep] = useState<"idle" | "sign" | "email">("idle");

  const { register, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dailyReflection = getDailyReflection();

  // If redirected from login with ?wallet=, pre-fill and prompt re-sign
  useEffect(() => {
    const wallet = searchParams.get("wallet");
    if (wallet) {
      setWalletAddress(wallet);
      setWalletStep("sign");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(name, email, password);
    if (result.success) {
      toast.success("Account created. Let's calibrate your baseline.");
      router.push("/onboarding");
    } else {
      toast.error(result.error || "Registration failed.");
    }
    setLoading(false);
  };

  // Step 1: Connect MetaMask and get a fresh nonce + signature
  const handleWalletConnect = async () => {
    setWalletLoading(true);
    try {
      const address = walletAddress ?? await connectMetaMask();
      setWalletAddress(address);

      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { nonce, message } = await nonceRes.json();

      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [message, address],
      }) as string;

      setWalletNonce(nonce);
      setWalletSignature(signature);
      setWalletStep("email");
      toast.success("Wallet verified. Now enter your email to finish.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("not installed")) toast.error("MetaMask not found. Install it at metamask.io");
      else if (msg.includes("User rejected") || msg.includes("user rejected")) toast("Signature cancelled.", { icon: "✋" });
      else toast.error("Wallet connection failed.");
    }
    setWalletLoading(false);
  };

  // Step 2: Submit email + pre-signed wallet credentials
  const handleWalletRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !walletNonce || !walletSignature) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletAddress,
          signature: walletSignature,
          nonce: walletNonce,
          email,
          name: name || `User ${walletAddress.slice(0, 6)}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await refreshUser();
        toast.success("Account created with wallet.");
        router.push("/onboarding");
      } else {
        toast.error(json.error || "Registration failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="fixed top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-serif font-semibold text-lg text-matte-black">Constavita</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card padding="lg" variant="elevated">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏛️</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-matte-black mb-2">Begin with clarity.</h1>
            <p className="text-sm text-slate-calm">Your free account is the first step toward a more examined life.</p>
          </div>

          {/* ── WALLET FLOW ── */}
          {walletStep === "idle" && (
            <>
              <button
                onClick={handleWalletConnect}
                disabled={walletLoading}
                className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-2xl py-3 px-4 text-sm font-medium text-matte-black hover:border-amber-300 hover:bg-amber-50 transition-all mb-5 disabled:opacity-60"
              >
                {walletLoading
                  ? <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                  : <MetaMaskIcon />
                }
                {walletLoading ? "Waiting for MetaMask…" : "Register with MetaMask"}
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-xs text-stone-400">or register with email</span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>
            </>
          )}

          {walletStep === "sign" && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-soft-gold" />
                <span className="text-sm font-medium text-matte-black">Wallet detected</span>
              </div>
              <p className="text-xs text-stone-500 font-mono mb-3">
                {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-4)}
              </p>
              <button
                onClick={handleWalletConnect}
                disabled={walletLoading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
              >
                {walletLoading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <MetaMaskIcon />
                }
                {walletLoading ? "Waiting…" : "Sign to verify ownership"}
              </button>
              <button onClick={() => setWalletStep("idle")} className="text-xs text-slate-calm mt-2 hover:text-matte-black">
                Use email instead
              </button>
            </div>
          )}

          {walletStep === "email" && (
            <>
              <div className="mb-5 bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-800">Wallet verified</p>
                  <p className="text-xs text-green-600 font-mono">{walletAddress?.slice(0, 10)}…{walletAddress?.slice(-4)}</p>
                </div>
              </div>

              <form onSubmit={handleWalletRegister} className="space-y-4 mb-6">
                <div>
                  <label className="label-field">Full name (optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name" autoComplete="name" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="label-field">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" required autoComplete="email" className="input-field pl-10" />
                  </div>
                  <p className="text-xs text-slate-calm mt-1">Used for account recovery. No password needed.</p>
                </div>
                <Button type="submit" variant="gold" fullWidth size="lg" loading={loading}
                  icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Create Wallet Account
                </Button>
              </form>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-stone-100" />
                <button onClick={() => setWalletStep("idle")} className="text-xs text-stone-400 hover:text-slate-calm">
                  Use email + password instead
                </button>
                <div className="flex-1 h-px bg-stone-100" />
              </div>
            </>
          )}

          {/* ── EMAIL/PASSWORD FORM (shown when not in wallet email step) ── */}
          {walletStep !== "email" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-field">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" required minLength={2} autoComplete="name" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="label-field">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="label-field">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password"
                    required autoComplete="new-password" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-calm hover:text-matte-black transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 space-y-1">
                    {passwordRequirements.map((req) => {
                      const met = req.regex.test(password);
                      return (
                        <div key={req.label} className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${met ? "text-green-500" : "text-stone-300"}`} />
                          <span className={`text-xs ${met ? "text-green-600" : "text-stone-400"}`}>{req.label}</span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
              <Button type="submit" variant="gold" fullWidth size="lg" loading={loading}
                icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Create Free Account
              </Button>
            </form>
          )}

          {/* What you gain */}
          <div className="mt-6 pt-6 border-t border-stone-100 space-y-2">
            {["Free dashboard with core metrics", "All 5 calculator assessments", "Decision Journal & Morning Intention", "No credit card · No pressure"].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span className="text-xs text-slate-calm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-calm">
              Already have an account?{" "}
              <Link href="/login" className="text-soft-gold font-medium hover:text-brand-600 transition-colors">Sign In</Link>
            </p>
          </div>
        </Card>

        <div className="mt-6">
          <DailyReflection reflection={dailyReflection} variant="inline" />
        </div>

        <p className="text-center text-xs text-stone-400 mt-6 px-4">
          By creating an account, you agree to our{" "}
          <Link href="/legal/terms" className="underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-premium" />}>
      <RegisterForm />
    </Suspense>
  );
}
