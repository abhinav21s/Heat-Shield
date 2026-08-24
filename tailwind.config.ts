import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E07A5F",
          dark: "#C26A52",
          light: "#FDF6F0",
          surface: "#F8EDE6",
          border: "#EADFD8",
        },
        ink: {
          primary: "#2D2A26",
          secondary: "#6B6560",
          muted: "#9E9790",
        },
        risk: {
          low: "#81B29A",
          moderate: "#F2CC8F",
          high: "#E07A5F",
          extreme: "#D62828",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(45, 42, 38, 0.06), 0 2px 6px -1px rgba(45, 42, 38, 0.04)",
        card: "0 10px 30px -4px rgba(224, 122, 95, 0.08), 0 4px 12px -2px rgba(45, 42, 38, 0.05)",
        glow: "0 0 25px rgba(224, 122, 95, 0.25)",
        dangerGlow: "0 0 25px rgba(214, 40, 40, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "heat-shimmer": "heat 2s ease-in-out infinite alternate",
      },
      keyframes: {
        heat: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(1.04)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
