import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C9A84C",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://constavita.com"),
  title: {
    default: "Constavita — AI-Powered Decision Intelligence",
    template: "%s | Constavita",
  },
  description:
    "An AI-powered decision intelligence platform that helps you evaluate the sustainability and emotional consequences of life decisions using behavioral analytics, explainable models, and Stoic-inspired reflection.",
  keywords: [
    "burnout calculator",
    "decision fatigue calculator",
    "financial peace calculator",
    "life balance calculator",
    "stoic decision making",
    "AI decision intelligence",
    "relationship sustainability",
    "emotional analytics",
  ],
  openGraph: {
    title: "Constavita — AI-Powered Decision Intelligence",
    description:
      "Evaluate life decisions with behavioral analytics, Stoic wisdom, and explainable AI models.",
    siteName: "Constavita",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@constavita_ai",
    creator: "@constavita_ai",
    title: "Constavita — AI-Powered Decision Intelligence",
    description: "Evaluate life decisions with Stoic wisdom and explainable AI.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Constavita — AI-Powered Decision Intelligence" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="https://constavita.com/feed.xml"
          title="Constavita Blog RSS Feed"
        />
      </head>
      <body className="bg-warm-white text-matte-black antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1C1C1E",
                color: "#FAF9F6",
                borderRadius: "12px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              },
              success: {
                iconTheme: { primary: "#C9A84C", secondary: "#FAF9F6" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#FAF9F6" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
