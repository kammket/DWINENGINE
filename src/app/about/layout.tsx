import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Limitum",
  url: "https://limitum.ai/about",
  description:
    "Limitum is an AI-powered decision intelligence platform grounded in Stoic philosophy and behavioural science. We help you measure the sustainability of life decisions across five dimensions.",
  publisher: {
    "@type": "Organization",
    name: "Limitum",
    url: "https://limitum.ai",
  },
};

export const metadata: Metadata = {
  title: "About Limitum — AI Decision Intelligence Built on Stoic Philosophy",
  description:
    "Limitum helps you measure the sustainability of your life decisions using AI-powered calculators grounded in Stoic philosophy and behavioural science. Not therapy. Not prediction. Clarity.",
  alternates: { canonical: "https://limitum.ai/about" },
  openGraph: {
    title: "About Limitum — AI Decision Intelligence Built on Stoic Philosophy",
    description:
      "We help you measure the sustainability of your life decisions. Not therapy. Not prediction. A rational mirror.",
    url: "https://limitum.ai/about",
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
