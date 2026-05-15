import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_COLORS: Record<string, string> = {
  Wellbeing: "#16A34A",
  "Decision Intelligence": "#C9A84C",
  "Financial Wellness": "#2563EB",
  "Time & Productivity": "#7C3AED",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "Constavita Blog";
  const excerpt = post?.excerpt ?? "Decision Intelligence & Stoic Wellbeing";
  const category = post?.category ?? "Constavita";
  const readingTime = post?.readingTime ?? 5;
  const accentColor = CATEGORY_COLORS[category] ?? "#C9A84C";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#1C1C1E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "64px 80px",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #C9A84C, #B8860B)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              C
            </div>
            <span style={{ fontSize: "20px", fontWeight: "600", color: "#FAF9F6", fontFamily: "serif" }}>
              Constavita
            </span>
          </div>
          <div
            style={{
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}66`,
              borderRadius: "100px",
              padding: "8px 18px",
              fontSize: "14px",
              color: accentColor,
              fontFamily: "sans-serif",
              fontWeight: "600",
            }}
          >
            {category}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: title.length > 60 ? "44px" : "52px",
              fontWeight: "700",
              color: "#FAF9F6",
              lineHeight: 1.2,
              maxWidth: "960px",
              fontFamily: "serif",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#9E9E9E",
              maxWidth: "800px",
              lineHeight: 1.5,
              fontFamily: "sans-serif",
            }}
          >
            {excerpt.length > 120 ? excerpt.slice(0, 117) + "…" : excerpt}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#6B7280", fontFamily: "sans-serif" }}>
            <span>{readingTime} min read</span>
          </div>
          <div style={{ width: "4px", height: "4px", background: "#6B7280", borderRadius: "50%" }} />
          <div style={{ fontSize: "16px", color: "#C9A84C", fontFamily: "sans-serif" }}>constavita.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
