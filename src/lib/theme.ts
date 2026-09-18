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
  },

  parchment: {
    surface: "#faf6ed", // warm cream — like aged paper
    surfaceRaised: "#f3ecdc", // slightly darker cream for cards
    surfaceSunken: "#efe5d0", // input backgrounds, code
    border: "#e0d5be", // soft tan border
    textPrimary: "#2a1f14", // deep brown ink
    textSecondary: "#4a3a28", // warm brown
    textMuted: "#7a6a52", // muted brown
    textFaint: "#a89880", // faded ink
    accent: "#b8860b", // darker, warmer gold that reads on cream
    accentHover: "#d4a017",
    accentMuted: "rgba(184, 134, 11, 0.12)",
  },

  midnight: {
    surface: "#080b14", // near-black with blue undertone
    surfaceRaised: "#0e1320", // deep navy-gray
    surfaceSunken: "#050810",
    border: "#1a2233", // subtle blue-gray border
    textPrimary: "#e8ecf3", // soft off-white, slight blue
    textSecondary: "#b0b8c8",
    textMuted: "#7a8497",
    textFaint: "#525c6e",
    accent: "#d4af6e", // warm champagne gold — softer than stone's
    accentHover: "#e5c48a",
    accentMuted: "rgba(212, 175, 110, 0.15)",
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
//parchment

export const THEME_ORDER: ReadingTheme[] = ["parchment", "stone", "midnight"];

/**
 * Preview colors for the settings page — a 3-color swatch showing
 * the theme's surface, text, and accent at a glance.
 */
export function themePreviewColors(theme: ReadingTheme) {
  const p = THEMES[theme];
  return {
    surface: p.surface,
    text: p.textPrimary,
    accent: p.accent,
  };
}
