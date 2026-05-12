"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-serif font-semibold text-xl text-matte-black">Limitum</span>
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
              <Link href="/register">
                <Button variant="primary" size="sm">Get Started Free</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-stone-100 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-warm-white border-t border-stone-100 px-6 py-4 space-y-4"
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
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
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
              <span className="font-serif font-semibold text-xl">Limitum</span>
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
            © {new Date().getFullYear()} Limitum. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
