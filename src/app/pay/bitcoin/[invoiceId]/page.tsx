"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bitcoin,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import toast from "react-hot-toast";

type InvoiceStatus = "PENDING" | "MEMPOOL" | "CONFIRMED" | "EXPIRED";

type InvoiceData = {
  status: InvoiceStatus;
  plan: string;
  usdAmount: number; // cents
  btcAddress: string;
  satoshis: number;
  expiresAt: string;
  txid?: string;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function satoshisToBtc(s: number) {
  return (s / 1e8).toFixed(8);
}

const PLAN_LABELS: Record<string, string> = {
  premium_monthly:    "Premium — Monthly",
  premium_annual:     "Premium — Annual",
  enterprise_monthly: "Enterprise — Monthly",
};

// ─── sub-components ───────────────────────────────────────────────────────────

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3">
      <span className="font-mono text-sm text-matte-black break-all flex-1 select-all">
        {value}
      </span>
      <button
        onClick={copy}
        className="p-1.5 rounded-xl hover:bg-stone-200 transition-colors text-slate-calm hover:text-soft-gold flex-shrink-0"
        title={`Copy ${label}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 5 * 60 * 1000);
      setRemaining(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <span className={`font-mono text-sm font-semibold ${urgent ? "text-red-500" : "text-slate-calm"}`}>
      {remaining}
    </span>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = {
    PENDING:   { label: "Waiting for payment",     color: "bg-stone-100 text-slate-calm",        dot: "bg-stone-400",   pulse: false },
    MEMPOOL:   { label: "Transaction detected",     color: "bg-amber-50 text-amber-700",          dot: "bg-amber-500",   pulse: true  },
    CONFIRMED: { label: "Payment confirmed",        color: "bg-green-50 text-green-700",          dot: "bg-green-500",   pulse: false },
    EXPIRED:   { label: "Invoice expired",          color: "bg-red-50 text-red-600",              dot: "bg-red-400",     pulse: false },
  }[status];

  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${config.pulse ? "animate-calm-pulse" : ""}`} />
      {config.label}
    </span>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function BitcoinPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch live BTC price every 60 s (display only, invoice amount is already locked)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await res.json();
        setLivePrice(data?.bitcoin?.usd ?? null);
      } catch {
        // non-critical
      }
    };
    fetchPrice();
    const id = setInterval(fetchPrice, 60_000);
    return () => clearInterval(id);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payments/bitcoin/status/${invoiceId}`);
      if (!res.ok) {
        const errorBody = (await res.json().catch(() => null)) as { error?: string } | null;
        setLoadError(errorBody?.error || "Failed to load invoice.");
        return;
      }
      const data: InvoiceData = await res.json();
      setLoadError(null);
      setInvoice(data);
      setLastChecked(new Date());

      if (data.status === "CONFIRMED") {
        clearInterval(pollRef.current!);
        setTimeout(() => router.push("/dashboard?upgraded=true"), 3000);
      }
      if (data.status === "EXPIRED") {
        clearInterval(pollRef.current!);
      }
    } catch {
      setLoadError("Failed to load invoice.");
    } finally {
      setLoading(false);
    }
  }, [invoiceId, router]);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 15_000);
    return () => clearInterval(pollRef.current!);
  }, [fetchStatus]);

  // ── loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-soft-gold animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
        <Card padding="lg" className="text-center max-w-sm w-full">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-matte-black mb-2">
            {loadError === "Invoice not found." ? "Invoice not found" : "Unable to load invoice"}
          </h2>
          <p className="text-sm text-slate-calm mb-6">
            {loadError === "Invoice not found."
              ? "This payment link is invalid or has expired."
              : loadError || "The invoice could not be loaded right now. Please try again."}
          </p>
          <div className="space-y-3">
            <Button variant="gold" fullWidth onClick={() => {
              setLoading(true);
              fetchStatus();
            }}>
              Retry Loading Invoice
            </Button>
            <Link href="/pricing">
              <Button variant="secondary" fullWidth>View Plans</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const btcAmount = satoshisToBtc(invoice.satoshis);
  const usdDisplay = `$${(invoice.usdAmount / 100).toFixed(2)}`;
  const bitcoinUri = `bitcoin:${invoice.btcAddress}?amount=${btcAmount}&label=Constavita`;
  const planLabel = PLAN_LABELS[invoice.plan] || invoice.plan;

  // ── confirmed ─────────────────────────────────────────────────────────────

  if (invoice.status === "CONFIRMED") {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full"
        >
          <Card padding="lg" variant="elevated" className="text-center bg-gradient-to-br from-green-50 to-white border-green-100">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-5" />
            <h2 className="font-serif text-2xl font-bold text-matte-black mb-2">Payment Confirmed</h2>
            <p className="text-slate-calm text-sm mb-4">
              Your <strong>{planLabel}</strong> subscription is now active.
            </p>
            {invoice.txid && (
              <a
                href={`https://blockstream.info/tx/${invoice.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-soft-gold hover:underline mb-6"
              >
                View on blockchain
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <p className="text-xs text-slate-calm">Redirecting to your dashboard…</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── expired ───────────────────────────────────────────────────────────────

  if (invoice.status === "EXPIRED") {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
        <Card padding="lg" className="text-center max-w-sm w-full">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-matte-black mb-2">Invoice Expired</h2>
          <p className="text-sm text-slate-calm mb-6">
            This invoice has expired. BTC price changes require a fresh quote — please start a new checkout.
          </p>
          <Link href="/pricing">
            <Button variant="gold" fullWidth>Create New Invoice</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ── pending / mempool ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-4"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 mb-4">
            <Bitcoin className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">Bitcoin Payment</span>
            {livePrice && (
              <span className="flex items-center gap-1 text-xs text-amber-600 border-l border-amber-200 pl-2 ml-1">
                <TrendingUp className="w-3 h-3" />
                ${livePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })} / BTC
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl font-bold text-matte-black">
            {usdDisplay} — {planLabel}
          </h1>
          <p className="text-sm text-slate-calm mt-1">
            Send the <strong>exact</strong> BTC amount below — your subscription activates automatically on confirmation.
          </p>
        </div>

        {/* Main card */}
        <Card padding="lg" variant="elevated">
          {/* Status */}
          <div className="flex items-center justify-between mb-6">
            <StatusBadge status={invoice.status} />
            <div className="flex items-center gap-1.5 text-xs text-slate-calm">
              <Clock className="w-3.5 h-3.5" />
              Expires in <Countdown expiresAt={invoice.expiresAt} />
            </div>
          </div>

          {/* Amount to send */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-matte-black uppercase tracking-wider mb-2">
              Step 1 — Send Exactly This Amount
            </p>
            <CopyField value={btcAmount} label="BTC amount" />
            <p className="text-xs text-stone-400 mt-1.5 pl-1">
              ≈ {usdDisplay} at today’s rate · unique amount identifies your payment
            </p>
          </div>

          {/* Address */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-matte-black uppercase tracking-wider mb-2">
              Step 2 — To This Address
            </p>
            <CopyField value={invoice.btcAddress} label="Bitcoin address" />
          </div>

          {/* Open in wallet CTA */}
          <a href={bitcoinUri}>
            <Button variant="gold" fullWidth icon={<Bitcoin className="w-4 h-4" />}>
              Open in Bitcoin Wallet
            </Button>
          </a>
        </Card>

        {/* Mempool notice */}
        <AnimatePresence>
          {invoice.status === "MEMPOOL" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card padding="md" className="bg-amber-50 border-amber-100">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0 animate-spin" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Transaction detected</p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      Your payment is in the mempool and awaiting one confirmation. This usually takes 10–30 minutes. You can close this page — your subscription will activate automatically once confirmed.
                    </p>
                    {invoice.txid && (
                      <a
                        href={`https://blockstream.info/tx/${invoice.txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline mt-2"
                      >
                        Track on blockchain <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info footer */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          {[
            { title: "0% Fees", subtitle: "No processor markup" },
            { title: "1 Confirmation", subtitle: "~10 min average" },
            { title: "Auto-activates", subtitle: "No manual review" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-stone-100 p-3">
              <p className="text-xs font-semibold text-matte-black">{item.title}</p>
              <p className="text-xs text-stone-400 mt-0.5">{item.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Auto-poll indicator */}
        <p className="text-center text-xs text-stone-400">
          Checking blockchain every 15 s
          {lastChecked && (
            <> · last checked {lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</>
          )}
        </p>
      </motion.div>
    </div>
  );
}
