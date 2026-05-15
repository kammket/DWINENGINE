import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Free Account — Constavita",
  description:
    "Join Constavita free — no credit card required. Access AI-powered life decision calculators, Stoic wisdom tools, Decision Journal, Virtue Compass, and personalised AI reflections.",
  alternates: { canonical: "https://constavita.com/register" },
  openGraph: {
    title: "Create Your Free Account — Constavita",
    description: "Start your free Constavita account. AI-powered decision intelligence grounded in Stoic philosophy.",
    url: "https://constavita.com/register",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
