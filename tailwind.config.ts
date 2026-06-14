import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0a0a0a",
          secondary: "#111111",
        },
        surface: {
          DEFAULT: "#141312",
          elevated: "#1c1916",
          hover: "#26231f",
        },
        text: {
          primary: "#f5f3ef",
          secondary: "#a8a29e",
          muted: "#6f6a64",
        },
        // Chrome accent (editorial warm-neutral, burnt orange) — actions, active nav, focus, glow.
        accent: {
          DEFAULT: "#ee692e",
          soft: "#f08a5d",
          dim: "rgba(238, 105, 46, 0.14)",
        },
        // Editorial warm-neutral base hues.
        ink: "#0a0a0a",
        bone: { DEFAULT: "#ded2c4", soft: "#ebe2d6" },
        orange: { DEFAULT: "#ee692e", soft: "#f08a5d", deep: "#c8501f" },
        green: { DEFAULT: "#85be9d", soft: "#a8d3bb" },
        pink: { DEFAULT: "#eb8299", soft: "#f0a8ba" },
        // Data / visualization colors — semantic meaning kept, remapped onto the warm palette.
        innovation: "#ee692e",
        funding: "#85be9d",
        contributor: "#f0a8ba",
        reputation: "#f08a5d",
        ai: "#eb8299",
        risk: "#d9544e",
        success: "#85be9d",
        warning: "#f08a5d",
        border: "rgba(255, 255, 255, 0.08)",
        "border-strong": "rgba(255, 255, 255, 0.14)",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        hero: ["48px", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["36px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["28px", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["22px", { lineHeight: "1.25", fontWeight: "600" }],
        body: ["15px", { lineHeight: "1.6" }],
        caption: ["13px", { lineHeight: "1.45" }],
      },
      borderRadius: {
        card: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        "glow-accent": "0 0 1px rgba(238,105,46,0.9), 0 0 24px rgba(238,105,46,0.45)",
        "glow-soft": "0 0 0 3px rgba(238,105,46,0.18)",
        "elev-1": "0 1px 2px rgba(0,0,0,0.35), 0 1px 1px rgba(0,0,0,0.2)",
        "elev-2": "0 8px 28px rgba(0,0,0,0.4)",
        "elev-3": "0 24px 64px rgba(0,0,0,0.5)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
