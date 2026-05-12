import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://limitum.ai"),
  title: {
    default: "Limitum — AI-Powered Decision Intelligence",
    template: "%s | Limitum",
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
    title: "Limitum — AI-Powered Decision Intelligence",
    description:
      "Evaluate life decisions with behavioral analytics, Stoic wisdom, and explainable AI models.",
    siteName: "Limitum",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Limitum — AI-Powered Decision Intelligence",
    description: "Evaluate life decisions with Stoic wisdom and explainable AI.",
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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
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
