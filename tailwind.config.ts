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
        mist: "#94a3b8"
      },
      boxShadow: {
        glow: "0 0 20px rgba(34,211,238,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
