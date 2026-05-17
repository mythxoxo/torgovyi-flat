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
          bg: "#06030a",
          panel: "#120917",
          panel2: "#1b1022",
          line: "#3a2247",
          cyan: "#53f6ff",
          acid: "#d7ff4f",
          magenta: "#ff46c7",
          orange: "#ff8b3d",
          green: "#3df6a2",
          muted: "#b79ec9"
        },
        mist: "#b79ec9"
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(83,246,255,0.15), 0 18px 40px rgba(0,0,0,0.45)",
        neon: "0 0 32px rgba(83,246,255,0.22), 0 0 80px rgba(255,70,199,0.08)"
      },
      animation: {
        marquee: "marquee 20s linear infinite",
        flicker: "flicker 2.2s steps(2,end) infinite",
        pulsebar: "pulsebar 1.8s ease-in-out infinite",
        hoverfloat: "hoverfloat 4.2s ease-in-out infinite"
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".78" }
        },
        pulsebar: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.18)" }
        },
        hoverfloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-3px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
