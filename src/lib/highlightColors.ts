/**
 * Highlight colors map a semantic name (from the backend) to a hex value.
 * Used as *font* colors — subtle tints over the dark background.
 *
 * The palette is chosen so each color is:
 *   - warm enough to feel at home on the stone-950 background
 *   - distinct from the other three
 *   - calm enough for long reading
 *   - never overpowering against the gold UI accent
 */
export const HIGHLIGHT_TEXT_COLORS: Record<string, string> = {
  // Default / not highlighted
  default: "#fafaf9", // text-primary — warm off-white

  // Highlighted colors (font-only)
  yellow: "#f5d47a", // warm amber, close to text-primary but distinctly gold
  gold: "#f5d47a", // alias for yellow
  green: "#9bd4a0", // muted sage green
  blue: "#8fbcf0", // soft sky blue
  pink: "#f0a8c8", // dusty rose
};

/**
 * Returns the font color for a given highlight color key.
 * Falls back to the default text color if the key is unknown.
 */
export function highlightTextColor(color: string | null | undefined): string {
  if (!color) return HIGHLIGHT_TEXT_COLORS.default;
  return HIGHLIGHT_TEXT_COLORS[color] ?? HIGHLIGHT_TEXT_COLORS.default;
}
