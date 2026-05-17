import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
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
        mist: "#8ba3c1"
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        glow: "0 20px 50px rgba(0, 136, 204, 0.15)"
      },
      animation: {
        marquee: "marquee 30s linear infinite"
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
