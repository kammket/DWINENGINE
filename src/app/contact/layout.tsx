import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Limitum",
  description:
    "Get in touch with the Limitum team for support, privacy requests, or press enquiries. We respond within one business day.",
  alternates: { canonical: "https://limitum.ai/contact" },
  openGraph: {
    title: "Contact — Limitum",
    description: "Reach the Limitum team. Support, privacy, and press enquiries welcome.",
    url: "https://limitum.ai/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
