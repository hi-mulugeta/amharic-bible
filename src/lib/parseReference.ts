/**
 * Parse a search query that looks like a Bible reference.
 *
 * Supported forms:
 *   "mat 1:1"                → single verse
 *   "mat 1:1-5"              → verse range
 *   "mat 1:1,3,5"            → verse list
 *   "mat 1:1-3,7,10"         → mixed
 *   "mat 1"                  → whole chapter
 *   "mat 1-3"                → chapter range
 *   "mat 1:1; john 3:16"     → multi-reference (semicolon)
 *
 * Book identifier accepts: slug, English abbreviation, Amharic name, or
 * any prefix that the suggest endpoint will resolve.
 *
 * Returns null if the query doesn't look like a reference.
 */

export type ParsedRefSegment = {
  bookQuery: string;
  chapter: number;
  verseSpec: string | null; // null = whole chapter
};

export type ParsedChapterRange = {
  bookQuery: string;
  startChapter: number;
  endChapter: number;
};

export type ParsedReference =
  | { kind: "verses"; segments: ParsedRefSegment[] }
  | { kind: "chapters"; range: ParsedChapterRange }
  | { kind: "unknown" };

/**
 * Regex to detect a verse reference segment.
 * Matches:  "mat 1:1"  "mat 1:1-5"  "mat 1:1,3,5"  "1john 3:16"
 * Book part allows letters, digits, and Amharic characters.
 */
const SEGMENT_RE = /^([\p{L}\p{M}0-9\s.]+?)\s+(\d+)(?::([\d,\-]+))?$/u;

/**
 * Regex for chapter range: "mat 1-3"
 */
const CHAPTER_RANGE_RE = /^([\p{L}\p{M}0-9\s.]+?)\s+(\d+)\s*-\s*(\d+)$/u;

export function parseReference(raw: string): ParsedReference | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  // Multi-reference (semicolon-separated)
  if (trimmed.includes(";")) {
    const parts = trimmed
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean);
    const segments: ParsedRefSegment[] = [];
    for (const part of parts) {
      const single = parseSingleSegment(part);
      if (!single) return null;
      segments.push(single);
    }
    if (segments.length === 0) return null;
    return { kind: "verses", segments };
  }

  // Chapter range: "mat 1-3"
  const crMatch = trimmed.match(CHAPTER_RANGE_RE);
  if (crMatch) {
    const [, bookQuery, startStr, endStr] = crMatch;
    const start = Number(startStr);
    const end = Number(endStr);
    if (start >= 1 && end >= start && end - start <= 50) {
      return {
        kind: "chapters",
        range: {
          bookQuery: bookQuery.trim(),
          startChapter: start,
          endChapter: end,
        },
      };
    }
  }

  // Single segment: "mat 1:1" or "mat 1"
  const single = parseSingleSegment(trimmed);
  if (single) {
    return { kind: "verses", segments: [single] };
  }

  return null;
}

function parseSingleSegment(raw: string): ParsedRefSegment | null {
  const match = raw.trim().match(SEGMENT_RE);
  if (!match) return null;

  const [, bookQuery, chapterStr, verseSpec] = match;
  const chapter = Number(chapterStr);
  if (chapter < 1 || chapter > 200) return null;

  // Validate the verse spec if present
  if (verseSpec) {
    if (!isValidVerseSpec(verseSpec)) return null;
  }

  return {
    bookQuery: bookQuery.trim(),
    chapter,
    verseSpec: verseSpec ?? null,
  };
}

function isValidVerseSpec(spec: string): boolean {
  // Allow digits, commas, hyphens. E.g. "1", "1-5", "1,3,5", "1-3,7,10"
  if (!/^[\d,\-]+$/.test(spec)) return false;

  const parts = spec.split(",");
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-");
      if (!a || !b) return false;
      const start = Number(a);
      const end = Number(b);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
      if (start < 1 || end < 1) return false;
    } else {
      const n = Number(part);
      if (!Number.isFinite(n) || n < 1) return false;
    }
  }
  return true;
}

/**
 * Normalize a verse spec for the backend. The backend accepts
 * "1-3,7,10" directly, so we just return the input if present, or
 * "1-999" (all verses) if the whole chapter is requested.
 */
export function verseSpecForBackend(spec: string | null): string {
  return spec ?? "1-200";
}
