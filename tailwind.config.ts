import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#07080c",
        foreground: "#f4f4f6",
        surface: {
          50: "#161822",
          100: "#12131b",
          200: "#0c0d13",
          card: "#0f1017",
          border: "#1f2230",
          hover: "#1a1c26",
        },
        clutch: {
          purple: "#9333ea",
          neonPurple: "#a855f7",
          lightPurple: "#c084fc",
          blue: "#2563eb",
          neonBlue: "#38bdf8",
          gold: "#f59e0b",
          red: "#ef4444",
          green: "#10b981",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        "glow-purple": "0 0 25px -5px rgba(168, 85, 247, 0.4)",
        "glow-blue": "0 0 25px -5px rgba(56, 189, 248, 0.4)",
        "glow-gold": "0 0 25px -5px rgba(245, 158, 11, 0.35)",
        "glow-green": "0 0 25px -5px rgba(16, 185, 129, 0.35)",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 40, 200, 0.25), transparent)",
        "grid-pattern": "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow 2.5s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
