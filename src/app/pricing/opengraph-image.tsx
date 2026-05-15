import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Constavita Pricing — Free & Premium Plans";
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
          alignItems: "center",
          justifyContent: "center",
          padding: "72px 80px",
          gap: "48px",
        }}
      >
        {/* Free card */}
        <div
          style={{
            flex: 1,
            background: "white",
            border: "2px solid #E7E5E4",
            borderRadius: "24px",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#6B7280", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>Free</div>
          <div style={{ fontSize: "56px", fontWeight: "700", color: "#1C1C1E", fontFamily: "serif" }}>$0</div>
          <div style={{ fontSize: "18px", color: "#6B7280", fontFamily: "sans-serif" }}>No credit card required</div>
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {["All 5 calculators", "Decision Journal", "10 AI Reflections", "Morning Intention"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", color: "#374151", fontFamily: "sans-serif" }}>
                <div style={{ width: "20px", height: "20px", background: "#D1FAE5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Premium card */}
        <div
          style={{
            flex: 1,
            background: "#1C1C1E",
            border: "2px solid #C9A84C",
            borderRadius: "24px",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#C9A84C", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>Premium</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <div style={{ fontSize: "56px", fontWeight: "700", color: "#FAF9F6", fontFamily: "serif" }}>$19</div>
            <div style={{ fontSize: "20px", color: "#9E9E9E", fontFamily: "sans-serif" }}>/mo</div>
          </div>
          <div style={{ fontSize: "18px", color: "#9E9E9E", fontFamily: "sans-serif" }}>Everything in Free, plus:</div>
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {["Unlimited AI Reflections", "Scenario Simulator", "Longitudinal Analytics", "Virtue Compass"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", color: "#FAF9F6", fontFamily: "sans-serif" }}>
                <div style={{ width: "20px", height: "20px", background: "rgba(201,168,76,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#C9A84C" }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
