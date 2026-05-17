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
          bg: "#050816",
          ink: "#d9f7ff",
          panel: "#0b1125",
          panel2: "#101a36",
          line: "#17325f",
          cyan: "#31f2ff",
          acid: "#c7ff3d",
          hot: "#ff4fd8",
          warn: "#ff6a3d",
          mint: "#27f1a8",
          muted: "#7ba6c7"
        },
        mist: "#7ba6c7"
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(49,242,255,0.15), 0 20px 50px rgba(0,0,0,0.45)",
        neon: "0 0 24px rgba(49,242,255,0.22)"
      },
      animation: {
        marquee: "marquee 24s linear infinite",
        flicker: "flicker 2.6s steps(2,end) infinite",
        floatcard: "floatcard 6s ease-in-out infinite"
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".82" }
        },
        floatcard: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-3px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
