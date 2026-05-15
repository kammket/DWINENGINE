import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Constavita",
  description:
    "Sign in to your Constavita account to access your AI-powered decision calculators, Stoic reflection tools, and personal analytics.",
  alternates: { canonical: "https://constavita.com/login" },
  openGraph: {
    title: "Sign In — Constavita",
    description: "Access your decision intelligence dashboard.",
    url: "https://constavita.com/login",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
