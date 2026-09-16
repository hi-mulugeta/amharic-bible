import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warm gold — the accent
        gold: {
          50: "#fef9ec",
          100: "#fdf0cd",
          200: "#fbdf95",
          300: "#f8c95e",
          400: "#f5b235",
          500: "#ec961a", // primary
          600: "#d17712",
          700: "#ad5811",
          800: "#8b4414",
          900: "#723913",
          950: "#421c06",
        },
        // Stone — the base (dark mode default)
        surface: {
          DEFAULT: "#0c0a09",
          raised: "#1c1917",
          sunken: "#0a0908",
          border: "#292524",
        },
        text: {
          primary: "#fafaf9",
          secondary: "#d6d3d1",
          muted: "#a8a29e",
          faint: "#78716c",
        },
      },
      fontFamily: {
        amharic: ["Menbere", "Nyala", '"Noto Serif Ethiopic"', "serif"],
        latin: ["Inter", "system-ui", "sans-serif"],
        sans: [
          "Menbere",
          "Nyala",
          '"Noto Serif Ethiopic"',
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Amharic needs more generous sizing
        verse: ["1.25rem", { lineHeight: "2.1", letterSpacing: "0.005em" }],
        "verse-sm": ["1.125rem", { lineHeight: "2", letterSpacing: "0.005em" }],
        "verse-lg": ["1.5rem", { lineHeight: "2.2", letterSpacing: "0.005em" }],
      },
      maxWidth: {
        reading: "42rem", // ~680px — optimal for Amharic
        reader: "56rem", // reading + margins
        shell: "96rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
