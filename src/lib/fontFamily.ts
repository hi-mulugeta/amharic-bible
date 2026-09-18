import type { ReadingFontFamily } from "@/stores/readerStore";

/**
 * Each option maps to a CSS font-family stack. The reading text uses
 * these inline to avoid the font-flash we fixed earlier — the family
 * is applied via inline style, not a Tailwind class that could toggle.
 */
export const FONT_FAMILY_STACKS: Record<ReadingFontFamily, string> = {
  "noto-sans": `'Noto Sans Ethiopic', 'Nyala', 'Menbere', 'Noto Serif Ethiopic', sans-serif`,
  menbere: `'Menbere', 'Nyala', 'Noto Sans Ethiopic', 'Noto Serif Ethiopic', serif`,
};

export const FONT_FAMILY_LABELS: Record<ReadingFontFamily, string> = {
  "noto-sans": "ኖቶ ሳንስ ኢትዮፒክ",
  menbere: "መንበሬ",
};

export const FONT_FAMILY_DESCRIPTIONS: Record<ReadingFontFamily, string> = {
  "noto-sans": "ንጹህ እና ዘመናዊ",
  menbere: "ለስላሳ እና የሚያነብ",
};

export const FONT_FAMILY_ORDER: ReadingFontFamily[] = ["noto-sans", "menbere"];

/**
 * Resolve a font family key to its CSS stack. Falls back to the
 * default (Noto Sans Ethiopic) if the key is unknown.
 */
export function fontFamilyStack(key: string | null | undefined): string {
  if (!key) return FONT_FAMILY_STACKS["noto-sans"];
  return (
    FONT_FAMILY_STACKS[key as ReadingFontFamily] ??
    FONT_FAMILY_STACKS["noto-sans"]
  );
}
