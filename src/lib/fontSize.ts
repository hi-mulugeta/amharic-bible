import type { ReadingFontSize } from "@/stores/readerStore";

/**
 * Map the font-size preference to the Tailwind text class.
 * The Tailwind classes are declared in tailwind.config.ts.
 */
export const FONT_SIZE_CLASS: Record<ReadingFontSize, string> = {
  sm: "text-verse-sm",
  md: "text-verse-md",
  lg: "text-verse-lg",
  xl: "text-verse-xl",
  "2xl": "text-verse-2xl",
};

export const FONT_SIZE_LABELS: Record<ReadingFontSize, string> = {
  sm: "ትንሽ",
  md: "መካከለኛ",
  lg: "መደበኛ",
  xl: "ትልቅ",
  "2xl": "በጣም ትልቅ",
};

export const FONT_SIZE_ORDER: ReadingFontSize[] = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];
