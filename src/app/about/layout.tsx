import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Constavita",
  url: "https://constavita.com/about",
  description:
    "Constavita is an AI-powered decision intelligence platform grounded in Stoic philosophy and behavioural science. We help you measure the sustainability of life decisions across five dimensions.",
  publisher: {
    "@type": "Organization",
    name: "Constavita",
    url: "https://constavita.com",
  },
};

export const metadata: Metadata = {
  title: "About Constavita — AI Decision Intelligence Built on Stoic Philosophy",
  description:
    "Constavita helps you measure the sustainability of your life decisions using AI-powered calculators grounded in Stoic philosophy and behavioural science. Not therapy. Not prediction. Clarity.",
  alternates: { canonical: "https://constavita.com/about" },
  openGraph: {
    title: "About Constavita — AI Decision Intelligence Built on Stoic Philosophy",
    description:
      "We help you measure the sustainability of your life decisions. Not therapy. Not prediction. A rational mirror.",
    url: "https://constavita.com/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
