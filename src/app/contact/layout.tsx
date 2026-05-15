import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Constavita",
  description:
    "Get in touch with the Constavita team for support, privacy requests, or press enquiries. We respond within one business day.",
  alternates: { canonical: "https://constavita.com/contact" },
  openGraph: {
    title: "Contact — Constavita",
    description: "Reach the Constavita team. Support, privacy, and press enquiries welcome.",
    url: "https://constavita.com/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
