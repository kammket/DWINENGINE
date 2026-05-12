import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Free Account — Limitum",
  description:
    "Join Limitum free — no credit card required. Access AI-powered life decision calculators, Stoic wisdom tools, Decision Journal, Virtue Compass, and personalised AI reflections.",
  alternates: { canonical: "https://limitum.ai/register" },
  openGraph: {
    title: "Create Your Free Account — Limitum",
    description: "Start your free Limitum account. AI-powered decision intelligence grounded in Stoic philosophy.",
    url: "https://limitum.ai/register",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
