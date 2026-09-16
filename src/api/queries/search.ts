import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { request } from "@/api/client";

// ---------- Types ----------

export type SearchVerse = {
  id: number;
  book_id: number;
  book_slug?: string;
  book_name_am?: string;
  chapter: number;
  verse_number: number;
  verse_number_ethiopic?: string;
  text_am: string; // may contain <mark>...</mark>
  match?: "fts" | "trigram";
};

export type SearchCommentary = {
  id: number;
  verse_id: number;
  excerpt_am: string | null;
  content_am?: string; // present in unified response
  author_name_am?: string | null;
  author_slug?: string | null;
  match?: "fts" | "trigram";
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
};

// ---------- Hooks ----------

/** Unified search (verses + commentaries). Best for the "all" scope. */
export function useUnifiedSearch(
  q: string,
  scope: "all" | "verses" | "commentaries" = "all",
  opts?: { enabled?: boolean; highlight?: boolean },
) {
  const trimmed = q.trim();
  return useQuery({
    enabled: (opts?.enabled ?? true) && trimmed.length >= 2,
    queryKey: searchKeys.unified(trimmed, scope),
    queryFn: () =>
      request<UnifiedSearchResponse>("/api/search", {
        query: {
          q: trimmed,
          scope,
          mode: "both",
          limit: 30,
          highlight: opts?.highlight ?? true,
        },
      }),
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
