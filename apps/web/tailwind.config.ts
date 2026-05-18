import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0f1a",
          surface: "#111827",
          surface2: "#1a2235",
          border: "#1e3a5f",
          blue: "#0088cc",
          teal: "#00b4d8",
          green: "#00c896",
          red: "#ff4757",
          muted: "#8ba3c1"
        },
        panel: "#09131f",
        line: "#163047",
        ink: "#e2e8f0",
        mist: "#8aa1b5",
        signal: "#4ade80",
        warning: "#f59e0b",
        rose: "#fb7185"
      },
      fontFamily: {
        syne: ["var(--font-syne)"],
        mono: ["var(--font-mono)"]
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        marquee: "marquee 30s linear infinite"
      },
      boxShadow: {
        glow: "0 24px 90px rgba(34, 211, 238, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
