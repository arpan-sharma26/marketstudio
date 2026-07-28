import type { Config } from "tailwindcss";

/**
 * Brand palette derived from the Market Studio logo:
 * mint → teal → deep navy pixel wave, charcoal wordmark, soft off-white ground.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8faf5",
          100: "#c9f2e8",
          200: "#96e5d3",
          300: "#5fd4bf",
          400: "#2fc4ae",
          500: "#14a896",
          600: "#0f8a7c",
          700: "#0c6b62",
          800: "#0a4f4c",
          900: "#0a2f3d",
          950: "#071824",
        },
        ink: {
          DEFAULT: "var(--ms-ink)",
          muted: "var(--ms-ink-muted)",
          soft: "var(--ms-ink-soft)",
        },
        paper: {
          DEFAULT: "var(--ms-paper)",
          elevated: "var(--ms-paper-elevated)",
          warm: "var(--ms-paper-warm)",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 18px 50px -24px rgba(10, 47, 61, 0.35)",
        soft: "0 10px 30px -18px rgba(10, 47, 61, 0.18)",
      },
      backgroundImage: {
        "brand-wave":
          "linear-gradient(135deg, #96e5d3 0%, #2fc4ae 42%, #0a2f3d 100%)",
        "brand-mist": "var(--ms-brand-mist)",
      },
    },
  },
  plugins: [],
};

export default config;
