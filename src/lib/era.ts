/**
 * Amharic labels for the patristic era taxonomy used by the backend.
 * The backend stores canonical English strings; we translate for display.
 */
export const ERA_LABELS: Record<string, string> = {
  Apostolic: "ሐዋርያዊ",
  "Ante-Nicene": "ቅድመ-ኒቅያ",
  Nicene: "ኒቅያ",
  "Post-Nicene": "ድህረ-ኒቅያ",
};

export function eraLabel(era: string | null | undefined): string | null {
  if (!era) return null;
  return ERA_LABELS[era] ?? era;
}
