import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Constavita Calculators — 5 Free Life Sustainability Assessments";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CALCULATORS = [
  { name: "Financial Peace", color: "#2563EB" },
  { name: "Burnout Risk", color: "#DC2626" },
  { name: "Relationship Health", color: "#D97706" },
  { name: "Decision Quality", color: "#7C3AED" },
  { name: "Time Value", color: "#059669" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAF9F6",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "linear-gradient(135deg, #C9A84C, #B8860B)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            C
          </div>
          <span style={{ fontSize: "22px", fontWeight: "600", color: "#1C1C1E", fontFamily: "serif" }}>Constavita</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
            5 Free Assessments
          </div>
          <div style={{ fontSize: "52px", fontWeight: "700", color: "#1C1C1E", lineHeight: 1.15, fontFamily: "serif" }}>
            Life Sustainability Calculators
          </div>
          <div style={{ fontSize: "24px", color: "#6B7280", lineHeight: 1.5, maxWidth: "700px", fontFamily: "sans-serif" }}>
            Measure what actually matters — burnout risk, financial peace, relationships, time, and decision quality.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {CALCULATORS.map((c) => (
            <div
              key={c.name}
              style={{
                background: `${c.color}18`,
                border: `1px solid ${c.color}44`,
                borderRadius: "12px",
                padding: "12px 20px",
                fontSize: "15px",
                color: c.color,
                fontFamily: "sans-serif",
                fontWeight: "600",
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
