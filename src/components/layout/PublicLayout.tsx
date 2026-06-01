"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/calculators", label: "Calculators" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function PublicHeader() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-stone-100" style={{ backgroundColor: 'var(--header-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-serif font-semibold text-xl" style={{ color: 'var(--page-text)' }}>Constavita</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-calm hover:text-matte-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="primary" size="sm">Get Started Free</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-stone-100 px-6 py-4 space-y-4"
            style={{ backgroundColor: 'var(--page-bg)' }}
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm font-medium text-slate-calm hover:text-matte-black" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
              {user ? (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" fullWidth>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" fullWidth>Sign In</Button>
                  </Link>
                  <Link href="/onboarding" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" fullWidth>Get Started Free</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/**
 * Sticky bottom CTA bar for mobile (non-authenticated visitors only).
 * Appears after the user scrolls past 80px so it doesn't compete with the hero.
 */
export function MobileStickyBar() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (user) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe pb-4 pt-3 border-t border-stone-100"
          style={{ backgroundColor: "var(--header-bg)", backdropFilter: "blur(12px)" }}
        >
          <Link href="/onboarding" className="block">
            <Button variant="gold" fullWidth size="md">
              Begin Your Assessment — Free
            </Button>
          </Link>
          <p className="text-center text-xs text-slate-calm mt-2">
            No credit card · No diagnosis · Just clarity
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Footer() {
  return (
    <footer className="bg-matte-black text-warm-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-serif font-semibold text-xl">Constavita</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              AI-powered decision intelligence for a calmer, clearer life.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: "/calculators", label: "Calculators" },
                { href: "/simulate", label: "Simulations" },
                { href: "/analytics", label: "Analytics" },
                { href: "/pricing", label: "Pricing" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-warm-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { href: "/legal/privacy", label: "Privacy Policy" },
                { href: "/legal/terms", label: "Terms of Service" },
                { href: "/legal/disclaimer", label: "AI Disclaimer" },
                { href: "/legal/gdpr", label: "GDPR" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-warm-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About" },
                { href: "/faq", label: "FAQ" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-warm-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-stone-800 pt-8">
          <p className="text-xs text-stone-500 leading-relaxed mb-4">
            <strong className="text-stone-400">Important Notice:</strong> This platform provides educational and reflective analytical tools designed to support self-awareness and decision-making. It does not provide medical, psychological, legal, or financial advice. All scores and projections are educational indices, not diagnoses or predictions. Always consult qualified professionals for decisions that affect your health, finances, or legal situation.
          </p>
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} Constavita. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
