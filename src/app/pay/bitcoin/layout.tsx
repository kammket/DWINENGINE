import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Payment — Constavita",
  description: "Complete your Bitcoin payment for your Constavita subscription.",
  robots: { index: false, follow: false },
};

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
