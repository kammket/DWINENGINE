import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Constavita",
  description: "Set up your Constavita profile and choose your Stoic philosopher guide.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
