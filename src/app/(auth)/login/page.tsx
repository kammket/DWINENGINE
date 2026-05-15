"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DailyReflection } from "@/components/ui/DailyReflection";
import { getDailyReflection } from "@/lib/stoic";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

// MetaMask fox SVG inline (no external dep)
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const { login, refreshUser } = useAuth();
  const router = useRouter();
  const dailyReflection = getDailyReflection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success("Welcome back.");
      router.refresh();
      router.push("/dashboard");
    } else {
      toast.error(result.error || "Login failed.");
    }
    setLoading(false);
  };

  const handleMetaMask = async () => {
    setWalletLoading(true);
    try {
      // Step 1: get wallet address from MetaMask
      const address = await connectMetaMask();

      // Step 2: request a nonce from the server
      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { nonce, message } = await nonceRes.json();

      // Step 3: ask MetaMask to sign the message (no gas, no transaction)
      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [message, address],
      }) as string;

      // Step 4: send signature to server for verification
      const authRes = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, nonce }),
      });
      const authJson = await authRes.json();

      if (authJson.success) {
        await refreshUser();
        toast.success("Signed in with MetaMask.");
        router.refresh();
        router.push(authJson.isNewUser ? "/onboarding" : "/dashboard");
      } else if (authJson.error === "wallet_not_found") {
        // Wallet not linked to any account — go to register with address pre-filled
        toast("No account found. Create one with your wallet.", { icon: "🦊" });
        router.push(`/register?wallet=${address}`);
      } else {
        toast.error(authJson.error || "Wallet sign-in failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("not installed")) {
        toast.error("MetaMask not found. Install it at metamask.io");
      } else if (msg.includes("User rejected") || msg.includes("user rejected")) {
        toast("Signature cancelled.", { icon: "✋" });
      } else {
        toast.error("MetaMask sign-in failed.");
      }
    }
    setWalletLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center px-4">
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
            <h1 className="font-serif text-2xl font-bold text-matte-black mb-2">Welcome back</h1>
            <p className="text-sm text-slate-calm">Your clarity awaits.</p>
          </div>

          {/* MetaMask button */}
          <button
            onClick={handleMetaMask}
            disabled={walletLoading}
            className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-2xl py-3 px-4 text-sm font-medium text-matte-black hover:border-amber-300 hover:bg-amber-50 transition-all mb-5 disabled:opacity-60"
          >
            {walletLoading ? (
              <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MetaMaskIcon />
            )}
            {walletLoading ? "Waiting for MetaMask…" : "Continue with MetaMask"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-xs text-stone-400">or sign in with email</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-calm hover:text-matte-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-soft-gold hover:text-brand-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="gold" fullWidth size="lg" loading={loading}
              icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-calm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-soft-gold font-medium hover:text-brand-600 transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6">
          <DailyReflection reflection={dailyReflection} variant="inline" />
        </div>

        <p className="text-center text-xs text-stone-400 mt-6 px-4">
          By signing in, you agree to our{" "}
          <Link href="/legal/terms" className="underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
