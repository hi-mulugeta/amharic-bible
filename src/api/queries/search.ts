import { useQuery, useQueries, keepPreviousData } from "@tanstack/react-query";
import { request } from "@/api/client";
import type { ChapterOut } from "@/api/queries/bible";
import { parseReference, verseSpecForBackend } from "@/lib/parseReference";

// ---------- Types ----------

export type SearchVerse = {
  id: number;
  book_id: number;
  book_slug?: string;
  book_name_am?: string;
  chapter: number;
  verse_number: number;
  verse_number_ethiopic?: string;
  text_am: string;
  match?: "fts" | "trigram" | "advanced" | "trigram_fallback";
};

export type SearchCommentary = {
  id: number;
  verse_id: number;
  excerpt_am: string | null;
  content_am?: string;
  author_name_am?: string | null;
  author_slug?: string | null;
  match?: "fts" | "trigram" | "advanced" | "trigram_fallback";
};

export type SearchAuthor = {
  id: number;
  slug: string;
  name_am: string;
  name_en: string | null;
  era: string | null;
  birth_year: number | null;
  death_year: number | null;
  ethiopian_venerated: boolean;
};

export type SuggestItem = {
  type: "book" | "topic" | "tag" | "author";
  id: number;
  slug: string;
  label_am: string;
  label_en: string | null;
};

export type SuggestResponse = {
  query: string;
  suggestions: SuggestItem[];
};

export type UnifiedSearchResponse = {
  query: string;
  normalized_query: string;
  results: {
    verses: SearchVerse[];
    commentaries: SearchCommentary[];
  };
};

export type Paged<T> = {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

type RefVerseResult = {
  bookSlug: string;
  bookNameAm: string;
  chapter: number;
  verseNumber: number;
  verseNumberEthiopic: string | null;
  textAm: string;
  verseId: number;
};

// ---------- Keys ----------

export const searchKeys = {
  all: ["search"] as const,
  unified: (q: string, scope: string) =>
    [...searchKeys.all, "unified", q, scope] as const,
  verses: (q: string, page: number, testament?: string, book?: string) =>
    [
      ...searchKeys.all,
      "verses",
      q,
      page,
      testament ?? "",
      book ?? "",
    ] as const,
  commentaries: (q: string, page: number, authorSlug?: string, era?: string) =>
    [
      ...searchKeys.all,
      "commentaries",
      q,
      page,
      authorSlug ?? "",
      era ?? "",
    ] as const,
  authors: (q: string, page: number) =>
    [...searchKeys.all, "authors", q, page] as const,
  suggest: (q: string) => [...searchKeys.all, "suggest", q] as const,
  resolveBook: (id: string) => [...searchKeys.all, "resolve-book", id] as const,
  ref: (slug: string, chapter: number, spec: string | null) =>
    ["bible", "ref", slug, chapter, spec] as const,
};

// ---------- Hooks ----------

/** Unified search (verses + commentaries). Best for the "all" scope. */
export function useUnifiedSearch(
  q: string,
  scope: "all" | "verses" | "commentaries" = "all",
  opts?: {
    enabled?: boolean;
    highlight?: boolean;
    mode?: "fts" | "trigram" | "both" | "advanced";
  },
) {
  const trimmed = q.trim();
  return useQuery({
    enabled: (opts?.enabled ?? true) && trimmed.length >= 2,
    queryKey: searchKeys.unified(
      trimmed,
      scope,
    ) as unknown as readonly unknown[],
    queryFn: () =>
      request<UnifiedSearchResponse & { mode?: string; tsquery?: string }>(
        "/api/search",
        {
          query: {
            q: trimmed,
            scope,
            mode: opts?.mode ?? "both",
            limit: 30,
            highlight: opts?.highlight ?? true,
          },
        },
      ),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useSearchVerses(
  q: string,
  opts: {
    page?: number;
    perPage?: number;
    testament?: "OT" | "NT";
    book?: string;
    highlight?: boolean;
  } = {},
) {
  const trimmed = q.trim();
  const page = opts.page ?? 1;
  return useQuery({
    enabled: trimmed.length >= 2,
    queryKey: searchKeys.verses(trimmed, page, opts.testament, opts.book),
    queryFn: () =>
      request<Paged<SearchVerse>>("/api/search/verses", {
        query: {
          q: trimmed,
          page,
          per_page: opts.perPage ?? 20,
          testament: opts.testament,
          book: opts.book,
          highlight: opts.highlight ?? true,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useSearchCommentaries(
  q: string,
  opts: {
    page?: number;
    perPage?: number;
    authorSlug?: string;
    era?: string;
    highlight?: boolean;
  } = {},
) {
  const trimmed = q.trim();
  const page = opts.page ?? 1;
  return useQuery({
    enabled: trimmed.length >= 2,
    queryKey: searchKeys.commentaries(trimmed, page, opts.authorSlug, opts.era),
    queryFn: () =>
      request<Paged<SearchCommentary>>("/api/search/commentaries", {
        query: {
          q: trimmed,
          page,
          per_page: opts.perPage ?? 20,
          author_slug: opts.authorSlug,
          era: opts.era,
          highlight: opts.highlight ?? true,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useSearchAuthors(q: string, opts: { page?: number } = {}) {
  const trimmed = q.trim();
  const page = opts.page ?? 1;
  return useQuery({
    enabled: trimmed.length >= 2,
    queryKey: searchKeys.authors(trimmed, page),
    queryFn: () =>
      request<Paged<SearchAuthor>>("/api/search/authors", {
        query: { q: trimmed, page, per_page: 20 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

/** Fast autocomplete for the input dropdown. Fires from 1 char. */
export function useSuggest(q: string, opts?: { enabled?: boolean }) {
  const trimmed = q.trim();
  return useQuery({
    enabled: (opts?.enabled ?? true) && trimmed.length >= 1,
    queryKey: searchKeys.suggest(trimmed),
    queryFn: () =>
      request<SuggestResponse>("/api/search/suggest", {
        query: { q: trimmed, limit: 8 },
      }),
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Book identifier resolution (via suggest)
// ------------------------------------------------------------

/**
 * Given a book identifier the user typed ("mat", "matthew", "ማቴ"),
 * resolve it to a canonical book slug via the suggest endpoint.
 * Falls back to using the identifier as-is if nothing matches.
 */
export function useResolvedBookSlug(
  identifier: string | null,
  opts?: { enabled?: boolean },
) {
  const trimmed = identifier?.trim() ?? "";
  return useQuery({
    enabled: (opts?.enabled ?? true) && trimmed.length >= 2,
    queryKey: searchKeys.resolveBook(trimmed),
    queryFn: async () => {
      const data = await request<SuggestResponse>("/api/search/suggest", {
        query: { q: trimmed, limit: 8 },
      });
      const books = data.suggestions.filter((s) => s.type === "book");
      if (books.length === 0) {
        return trimmed.toLowerCase();
      }
      const lower = trimmed.toLowerCase();
      const exact = books.find((b) => b.slug.toLowerCase() === lower);
      if (exact) return exact.slug;
      // Non-null assertion: we checked books.length > 0 above.
      return books[0]!.slug;
    },
    staleTime: 60 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Reference-based queries
// ------------------------------------------------------------

/**
 * Fetch verses from a parsed reference. Handles:
 *  - single segment (book + chapter + versespec)
 *  - multi-segment (loop of the above)
 *  - chapter range (mat 1-3)
 *
 * Resolves each book identifier via the suggest endpoint before
 * requesting the actual verses.
 */
export function useVerseReference(query: string, opts?: { enabled?: boolean }) {
  const parsed = parseReference(query);
  const enabled = (opts?.enabled ?? true) && parsed !== null;

  // Collect the distinct book identifiers we need to resolve.
  const bookIdentifiers: string[] = [];
  if (parsed) {
    if (parsed.kind === "verses") {
      bookIdentifiers.push(
        ...Array.from(new Set(parsed.segments.map((s) => s.bookQuery))),
      );
    } else if (parsed.kind === "chapters") {
      bookIdentifiers.push(parsed.range.bookQuery);
    }
  }

  // Resolve each identifier in parallel.
  const resolvedBooks = useQueries({
    queries: bookIdentifiers.map((id) => ({
      queryKey: searchKeys.resolveBook(id.trim()),
      queryFn: async () => {
        const data = await request<SuggestResponse>("/api/search/suggest", {
          query: { q: id.trim(), limit: 8 },
        });
        const books = data.suggestions.filter((s) => s.type === "book");
        if (books.length === 0) return id.trim().toLowerCase();
        const lower = id.trim().toLowerCase();
        const exact = books.find((b) => b.slug.toLowerCase() === lower);
        if (exact) return exact.slug;
        return books[0]!.slug;
      },
      enabled,
      staleTime: 60 * 60 * 1000,
    })),
  });

  // Map identifier → resolved slug
  const slugMap = new Map<string, string>();
  bookIdentifiers.forEach((id, i) => {
    const resolved = resolvedBooks[i]?.data;
    if (resolved) slugMap.set(id, resolved);
  });

  // Wait for all resolutions before fetching verses
  const allResolved =
    !enabled ||
    bookIdentifiers.length === 0 ||
    resolvedBooks.every((q) => q.isSuccess || q.isError);

  // Verse queries, one per segment (only when parsed.kind === "verses")
  const segmentQueries = useQueries({
    queries:
      parsed?.kind === "verses" && allResolved
        ? parsed.segments.map((seg) => {
            const slug =
              slugMap.get(seg.bookQuery) ?? seg.bookQuery.toLowerCase();
            return {
              queryKey: searchKeys.ref(
                slug,
                seg.chapter,
                JSON.stringify(seg.verseSpec),
              ),
              queryFn: async () => {
                const spec = verseSpecForBackend(seg.verseSpec);
                const url = `/api/bible/${encodeURIComponent(slug)}/${seg.chapter}/${spec}`;
                return request<{ verses: ChapterOut["verses"] }>(url);
              },
              enabled,
              staleTime: 5 * 60 * 1000,
              retry: false,
            };
          })
        : [],
  });

  // Range queries for chapter-range refs (only when parsed.kind === "chapters")
  const rangeQueries = useQueries({
    queries:
      parsed?.kind === "chapters" && allResolved
        ? (() => {
            // TypeScript knows parsed.kind === "chapters" here
            const range = parsed.range;
            const slug =
              slugMap.get(range.bookQuery) ?? range.bookQuery.toLowerCase();
            const count = range.endChapter - range.startChapter + 1;
            return Array.from({ length: count }, (_, i) => {
              const chapter = range.startChapter + i;
              return {
                queryKey: searchKeys.ref(slug, chapter, null),
                queryFn: async () => {
                  const url = `/api/bible/${encodeURIComponent(slug)}/${chapter}`;
                  return request<ChapterOut>(url);
                },
                enabled,
                staleTime: 5 * 60 * 1000,
                retry: false,
              };
            });
          })()
        : [],
  });

  // Aggregate state
  const isLoading =
    enabled &&
    (resolvedBooks.some((q) => q.isLoading) ||
      (parsed?.kind === "verses"
        ? segmentQueries.some((q) => q.isLoading)
        : parsed?.kind === "chapters"
          ? rangeQueries.some((q) => q.isLoading)
          : false));

  const isError =
    enabled &&
    (parsed?.kind === "verses"
      ? segmentQueries.every((q) => q.isError)
      : parsed?.kind === "chapters"
        ? rangeQueries.every((q) => q.isError)
        : false);

  // Flatten
  const verses: RefVerseResult[] = [];

  if (parsed?.kind === "verses") {
    segmentQueries.forEach((q, idx) => {
      const seg = parsed.segments[idx];
      if (!seg) return;
      const data = q.data;
      if (!data || !("verses" in data)) return;
      const slug = slugMap.get(seg.bookQuery) ?? seg.bookQuery.toLowerCase();
      for (const v of data.verses) {
        verses.push({
          bookSlug: slug,
          bookNameAm: v.book_name_am ?? seg.bookQuery,
          chapter: v.chapter,
          verseNumber: v.verse_number,
          verseNumberEthiopic: v.verse_number_ethiopic ?? null,
          textAm: v.text_am,
          verseId: v.id,
        });
      }
    });
  } else if (parsed?.kind === "chapters") {
    rangeQueries.forEach((q) => {
      const data = q.data;
      if (!data) return;
      for (const v of data.verses) {
        verses.push({
          bookSlug: data.book.slug,
          bookNameAm: data.book.name_am,
          chapter: v.chapter,
          verseNumber: v.verse_number,
          verseNumberEthiopic: v.verse_number_ethiopic ?? null,
          textAm: v.text_am,
          verseId: v.id,
        });
      }
    });
  }

  return {
    parsed,
    verses,
    isLoading,
    isError,
  };
}
