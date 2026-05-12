import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Limitum",
  description:
    "Sign in to your Limitum account to access your AI-powered decision calculators, Stoic reflection tools, and personal analytics.",
  alternates: { canonical: "https://limitum.ai/login" },
  openGraph: {
    title: "Sign In — Limitum",
    description: "Access your decision intelligence dashboard.",
    url: "https://limitum.ai/login",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
