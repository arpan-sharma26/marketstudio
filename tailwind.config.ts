import type { Config } from "tailwindcss";

/**
 * Brand palette derived from the Market Studio logo:
 * mint → teal → deep navy pixel wave, charcoal wordmark, soft off-white ground.
 */
const config: Config = {
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
          DEFAULT: "#2a3140",
          muted: "#5b6472",
          soft: "#8b93a1",
        },
        paper: {
          DEFAULT: "#f6f8f9",
          elevated: "#ffffff",
          warm: "#f3f6f7",
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
        "brand-mist":
          "radial-gradient(1200px 600px at 10% -10%, rgba(150, 229, 211, 0.45), transparent 55%), radial-gradient(900px 500px at 90% 10%, rgba(47, 196, 174, 0.18), transparent 50%), linear-gradient(180deg, #f6f8f9 0%, #eef5f4 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
