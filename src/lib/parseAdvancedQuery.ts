/**
 * Client-side inspection of an advanced search query.
 *
 * Detects:
 *   - Boolean operators: AND / OR / NOT
 *   - Quoted phrases:    "..."
 *   - Proximity:         A <n> B
 *
 * Returns a summary the UI uses for highlighting and hints.
 */

export type DetectedOperator = {
  kind: "and" | "or" | "not" | "phrase" | "proximity";
  text: string;
  index: number;
};

const PROXIMITY_RE = /(\S+)\s*<(\d{1,2})>\s*(\S+)/g;
const PHRASE_RE = /"([^"]+)"/g;
const OP_RE = /\b(AND|OR|NOT)\b/gi;

export function analyzeAdvancedQuery(q: string): {
  operators: DetectedOperator[];
  hasAdvancedSyntax: boolean;
  error: string | null;
} {
  const operators: DetectedOperator[] = [];

  if (!q.trim()) {
    return { operators: [], hasAdvancedSyntax: false, error: null };
  }

  // Proximity
  for (const m of q.matchAll(PROXIMITY_RE)) {
    operators.push({
      kind: "proximity",
      text: m[0],
      index: m.index ?? 0,
    });
  }

  // Phrases
  for (const m of q.matchAll(PHRASE_RE)) {
    operators.push({
      kind: "phrase",
      text: m[0],
      index: m.index ?? 0,
    });
  }

  // Boolean operators
  for (const m of q.matchAll(OP_RE)) {
    const value = m[1].toLowerCase();
    operators.push({
      kind: value === "and" ? "and" : value === "or" ? "or" : "not",
      text: m[0],
      index: m.index ?? 0,
    });
  }

  // Sort by index
  operators.sort((a, b) => a.index - b.index);

  // Basic error detection — bail on unbalanced quotes or trailing operators
  const quoteCount = (q.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    return {
      operators,
      hasAdvancedSyntax: true,
      error: 'ጥቅስ አልተዘጋም — ጥቅሱን በሁለት " መክፈት አለብዎት።',
    };
  }

  const trimmed = q.trim().toUpperCase();
  if (/(\bAND|\bOR|\bNOT)$/.test(trimmed)) {
    return {
      operators,
      hasAdvancedSyntax: true,
      error: "ፍለጋው በማገናኛ (AND/OR/NOT) ተጠናቋል።",
    };
  }

  return {
    operators,
    hasAdvancedSyntax: operators.length > 0,
    error: null,
  };
}
