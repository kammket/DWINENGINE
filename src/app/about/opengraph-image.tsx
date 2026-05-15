import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "About Constavita — AI Decision Intelligence Built on Stoic Philosophy";
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
          <span style={{ fontSize: "22px", fontWeight: "600", color: "#FAF9F6", fontFamily: "serif" }}>Constavita</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#C9A84C", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
            Our Story
          </div>
          <div style={{ fontSize: "52px", fontWeight: "700", color: "#FAF9F6", lineHeight: 1.15, fontFamily: "serif", maxWidth: "900px" }}>
            Built on 2,000 Years of Stoic Wisdom + Modern Behavioural Science
          </div>
          <div style={{ fontSize: "22px", color: "#9E9E9E", lineHeight: 1.5, maxWidth: "720px", fontFamily: "sans-serif" }}>
            Not therapy. Not prediction. A rational mirror for the decisions that shape your life.
          </div>
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          {["Marcus Aurelius", "Epictetus", "Seneca"].map((name) => (
            <div key={name} style={{ fontSize: "16px", color: "#C9A84C", fontFamily: "sans-serif", fontStyle: "italic" }}>
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
