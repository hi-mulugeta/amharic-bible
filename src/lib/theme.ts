import type { ReadingTheme } from "@/stores/readerStore";

export type ThemePalette = {
  /** Background — page base */
  surface: string;
  /** Raised surfaces — cards, modals, panels */
  surfaceRaised: string;
  /** Sunken surfaces — input backgrounds, code blocks */
  surfaceSunken: string;
  /** Border color */
  border: string;
  /** Primary text */
  textPrimary: string;
  /** Secondary text */
  textSecondary: string;
  /** Muted text */
  textMuted: string;
  /** Faintest text — hints, timestamps */
  textFaint: string;
  /** Accent (gold) — for links, highlights, active states */
  accent: string;
  /** Accent hover (lighter) */
  accentHover: string;
  /** Accent muted — chips, badges */
  accentMuted: string;
  /** Brand (logo red) — for brand-driven UI: active nav, logo marks */
  brand: string;
  /** Brand muted — subtle backgrounds behind brand elements */
  brandMuted: string;
};

export const THEMES: Record<ReadingTheme, ThemePalette> = {
  stone: {
    surface: "#0c0a09",
    surfaceRaised: "#1c1917",
    surfaceSunken: "#0a0908",
    border: "#292524",
    textPrimary: "#fafaf9",
    textSecondary: "#d6d3d1",
    textMuted: "#a8a29e",
    textFaint: "#78716c",
    accent: "#f5b235",
    accentHover: "#f8c95e",
    accentMuted: "rgba(245, 178, 53, 0.15)",
    brand: "#e61919", // brightened red for dark bg contrast
    brandMuted: "rgba(230, 25, 25, 0.15)",
  },

  parchment: {
    surface: "#faf6ed",
    surfaceRaised: "#f3ecdc",
    surfaceSunken: "#efe5d0",
    border: "#e0d5be",
    textPrimary: "#2a1f14",
    textSecondary: "#4a3a28",
    textMuted: "#7a6a52",
    textFaint: "#a89880",
    accent: "#b8860b",
    accentHover: "#d4a017",
    accentMuted: "rgba(184, 134, 11, 0.12)",
    brand: "#cc0000", // original logo red reads fine on cream
    brandMuted: "rgba(204, 0, 0, 0.10)",
  },

  midnight: {
    surface: "#080b14",
    surfaceRaised: "#0e1320",
    surfaceSunken: "#050810",
    border: "#1a2233",
    textPrimary: "#e8ecf3",
    textSecondary: "#b0b8c8",
    textMuted: "#7a8497",
    textFaint: "#525c6e",
    accent: "#d4af6e",
    accentHover: "#e5c48a",
    accentMuted: "rgba(212, 175, 110, 0.15)",
    brand: "#e61919", // brightened for blue-black bg
    brandMuted: "rgba(230, 25, 25, 0.15)",
  },
};

export const THEME_LABELS: Record<ReadingTheme, string> = {
  parchment: "ብራና",
  stone: "ጨለማ",
  midnight: "ግማሽ ሌሊት",
};

export const THEME_DESCRIPTIONS: Record<ReadingTheme, string> = {
  parchment: "ቀላል እና ጽሑፋዊ",
  stone: "ንቁ እና ሞቅ ያለ",
  midnight: "ለረጅም ሌሊት ንባብ",
};

export const THEME_ORDER: ReadingTheme[] = ["parchment", "stone", "midnight"];

export function themePreviewColors(theme: ReadingTheme) {
  const p = THEMES[theme];
  return {
    surface: p.surface,
    text: p.textPrimary,
    accent: p.accent,
  };
}
