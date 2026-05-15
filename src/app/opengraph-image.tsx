import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Constavita — AI-Powered Decision Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          padding: "72px 80px",
          fontFamily: "serif",
        }}
      >
        {/* Top: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #C9A84C, #B8860B)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            L
          </div>
          <span style={{ fontSize: "26px", fontWeight: "600", color: "#FAF9F6" }}>
            Constavita
          </span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "700",
              color: "#FAF9F6",
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            AI-Powered Decision Intelligence
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#9E9E9E",
              maxWidth: "720px",
              lineHeight: 1.5,
            }}
          >
            Measure the sustainability of your life decisions with Stoic philosophy and behavioural science.
          </div>
        </div>

        {/* Bottom: features row */}
        <div style={{ display: "flex", gap: "24px" }}>
          {["Burnout Risk", "Financial Peace", "Relationship Health", "Time Value", "Decision Quality"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(201, 168, 76, 0.15)",
                border: "1px solid rgba(201, 168, 76, 0.4)",
                borderRadius: "100px",
                padding: "10px 20px",
                fontSize: "16px",
                color: "#C9A84C",
                fontFamily: "sans-serif",
                fontWeight: "500",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
