import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FFFFF0",
        "warm-white": "#FAF9F6",
        "matte-black": "#1C1C1E",
        "soft-gold": "#C9A84C",
        "muted-blue": "#6B7FA3",
        "slate-calm": "#94A3B8",
        "stone-light": "#F5F5F0",
        "deep-charcoal": "#2D2D30",
        "sage-green": "#87A878",
        "rose-muted": "#C084A0",
        brand: {
          50: "#FDFAF1",
          100: "#FAF4DC",
          200: "#F2E7B3",
          300: "#E8D47A",
          400: "#D9BC49",
          500: "#C9A84C",
          600: "#A8893A",
          700: "#866C2D",
          800: "#645024",
          900: "#42351A",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "score-fill": "scoreFill 1.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        scoreFill: {
          "0%": { "stroke-dashoffset": "283" },
          "100%": { "stroke-dashoffset": "0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-premium":
          "linear-gradient(135deg, #FAF9F6 0%, #F5F0E8 50%, #FAF9F6 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #1C1C1E 0%, #2D2D30 50%, #1C1C1E 100%)",
        "gold-shimmer":
          "linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)",
      },
      boxShadow: {
        premium: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "premium-lg":
          "0 8px 48px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        gold: "0 0 0 1px rgba(201,168,76,0.3), 0 4px 24px rgba(201,168,76,0.1)",
        "gold-lg": "0 0 0 1px rgba(201,168,76,0.5), 0 8px 32px rgba(201,168,76,0.28)",
        "inner-gold": "inset 0 0 0 2px rgba(201,168,76,0.4)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [typography],
};
export default config;
