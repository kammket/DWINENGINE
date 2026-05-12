import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Payment — Limitum",
  description: "Complete your Bitcoin payment for your Limitum subscription.",
  robots: { index: false, follow: false },
};

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
