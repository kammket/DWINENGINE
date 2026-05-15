import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Constavita Blog — Decision Intelligence & Stoic Wellbeing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
            L
          </div>
          <span style={{ fontSize: "22px", fontWeight: "600", color: "#1C1C1E", fontFamily: "serif" }}>
            Constavita
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#C9A84C",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            Constavita Journal
          </div>
          <div
            style={{
              fontSize: "54px",
              fontWeight: "700",
              color: "#1C1C1E",
              lineHeight: 1.15,
              fontFamily: "serif",
            }}
          >
            Decision Intelligence &amp; Stoic Wellbeing
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#6B7280",
              maxWidth: "680px",
              lineHeight: 1.5,
              fontFamily: "sans-serif",
            }}
          >
            Evidence-based articles on burnout, financial peace, better decisions, and a well-lived life.
          </div>
        </div>

        <div
          style={{
            width: "80px",
            height: "4px",
            background: "linear-gradient(90deg, #C9A84C, #B8860B)",
            borderRadius: "2px",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
