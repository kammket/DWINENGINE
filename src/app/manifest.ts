import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Constavita — AI Decision Intelligence",
    short_name: "Constavita",
    description:
      "Measure the sustainability of your life decisions with AI-powered calculators grounded in Stoic philosophy.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#C9A84C",
    orientation: "portrait",
    categories: ["health", "lifestyle", "productivity"],
    icons: [
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/opengraph-image.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Constavita Dashboard",
      },
    ],
  };
}
