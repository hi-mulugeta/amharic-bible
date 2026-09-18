import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ------------------------------------------------------------
        // Accent — the gold. Same across themes (only hex differs slightly).
        // ------------------------------------------------------------
        gold: {
          50: "#fef9ec",
          100: "#fdf0cd",
          200: "#fbdf95",
          300: "#f8c95e",
          400: "#f5b235",
          500: "rgb(var(--color-accent) / <alpha-value>)",
          600: "#d17712",
          700: "#ad5811",
          800: "#8b4414",
          900: "#723913",
          950: "#421c06",
        },

        // ------------------------------------------------------------
        // Semantic surface + text tokens. These are the ones that
        // actually change with the theme.
        // ------------------------------------------------------------
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
          sunken: "rgb(var(--color-surface-sunken) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          faint: "rgb(var(--color-text-faint) / <alpha-value>)",
        },

        // ------------------------------------------------------------
        // Fixed palettes — same across themes. Used for status colors
        // (emerald for success, red for danger, etc.) and for
        // stone-* utilities we still want as literal gray.
        // ------------------------------------------------------------
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
      },
      fontFamily: {
        amharic: [
          "Menbere",
          "Nyala",
          '"Noto Sans Ethiopic"',
          '"Noto Serif Ethiopic"',
          "serif",
        ],
        "noto-ethiopic": [
          '"Noto Sans Ethiopic"',
          "Nyala",
          "Menbere",
          "sans-serif",
        ],
        sans: [
          "Menbere",
          "Nyala",
          '"Noto Sans Ethiopic"',
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "verse-sm": ["1.125rem", { lineHeight: "2", letterSpacing: "0.005em" }],
        "verse-md": [
          "1.25rem",
          { lineHeight: "2.05", letterSpacing: "0.005em" },
        ],
        "verse-lg": [
          "1.375rem",
          { lineHeight: "2.1", letterSpacing: "0.005em" },
        ],
        "verse-xl": ["1.5rem", { lineHeight: "2.1", letterSpacing: "0.005em" }],
        "verse-2xl": [
          "1.75rem",
          { lineHeight: "2.15", letterSpacing: "0.005em" },
        ],
        verse: ["1.375rem", { lineHeight: "2.1", letterSpacing: "0.005em" }],
      },
      maxWidth: {
        reading: "42rem",
        reader: "56rem",
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
