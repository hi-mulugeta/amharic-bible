import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { request } from "@/api/client";

// ---------- Types ----------

export type TopicOut = {
  id: number;
  slug: string;
  name_am: string;
  name_en: string | null;
  description_am: string | null;
  description_en: string | null;
};

export type TagOut = {
  id: number;
  slug: string;
  name_am: string;
  name_en: string | null;
};

export type DiscoveryVerse = {
  verse_id: number;
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number | null;
  verse_number: number | null;
  text_am: string | null;
  rank?: number;
};

export type PageMeta = {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type Paged<T> = {
  data: T[];
  meta: PageMeta;
};

// ---------- Keys ----------

export const discoveryKeys = {
  all: ["discovery"] as const,
  topics: (page: number, q: string) =>
    [...discoveryKeys.all, "topics", page, q] as const,
  topic: (slug: string) => [...discoveryKeys.all, "topic", slug] as const,
  topicVerses: (slug: string, page: number) =>
    [...discoveryKeys.all, "topic-verses", slug, page] as const,
  tags: (page: number) => [...discoveryKeys.all, "tags", page] as const,
  tag: (slug: string) => [...discoveryKeys.all, "tag", slug] as const,
  tagVerses: (slug: string, page: number) =>
    [...discoveryKeys.all, "tag-verses", slug, page] as const,
};

// ---------- Topics ----------

export function useTopics(opts?: {
  page?: number;
  q?: string;
  perPage?: number;
}) {
  const page = opts?.page ?? 1;
  const q = opts?.q?.trim() ?? "";
  return useQuery({
    queryKey: discoveryKeys.topics(page, q),
    queryFn: () =>
      request<Paged<TopicOut>>("/api/topics", {
        query: {
          page,
          per_page: opts?.perPage ?? 24,
          q: q.length >= 2 ? q : undefined,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });
}

export function useTopic(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: discoveryKeys.topic(slug ?? ""),
    queryFn: () => request<TopicOut>(`/api/topics/${slug}`),
    staleTime: 60 * 60 * 1000,
  });
}

export function useTopicVerses(
  slug: string | undefined,
  opts?: { page?: number },
) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: Boolean(slug),
    queryKey: discoveryKeys.topicVerses(slug ?? "", page),
    queryFn: () =>
      request<Paged<DiscoveryVerse>>(`/api/topics/${slug}/verses`, {
        query: { page, per_page: 30 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });
}

// ---------- Tags ----------

export function useTags(opts?: { page?: number; perPage?: number }) {
  const page = opts?.page ?? 1;
  return useQuery({
    queryKey: discoveryKeys.tags(page),
    queryFn: () =>
      request<Paged<TagOut>>("/api/tags", {
        query: { page, per_page: opts?.perPage ?? 50 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });
}

export function useTag(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: discoveryKeys.tag(slug ?? ""),
    queryFn: () => request<TagOut>(`/api/tags/${slug}`),
    staleTime: 60 * 60 * 1000,
  });
}

export function useTagVerses(
  slug: string | undefined,
  opts?: { page?: number },
) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: Boolean(slug),
    queryKey: discoveryKeys.tagVerses(slug ?? "", page),
    queryFn: () =>
      request<Paged<DiscoveryVerse>>(`/api/tags/${slug}/verses`, {
        query: { page, per_page: 30 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });
}
// ---------- Verse tags ----------

export function useVerseTags(
  bookSlug: string | null | undefined,
  chapter: number | null | undefined,
  verseNumber: number | null | undefined,
  opts?: { translation?: string },
) {
  const enabled =
    Boolean(bookSlug) &&
    typeof chapter === "number" &&
    typeof verseNumber === "number";

  return useQuery({
    enabled,
    queryKey: [
      ...discoveryKeys.all,
      "verse-tags",
      bookSlug ?? "",
      chapter ?? 0,
      verseNumber ?? 0,
      opts?.translation ?? "AMH1954",
    ],
    queryFn: () =>
      request<TagOut[]>(
        `/api/bible/${bookSlug}/${chapter}/${verseNumber}/tags`,
        { query: { translation: opts?.translation ?? "AMH1954" } },
      ),
    staleTime: 60 * 60 * 1000,
  });
}
// ============================================================
// Verse-centric discovery — topics, cross-refs, parallels
// ============================================================

export type CrossReferenceOut = {
  id: number;
  target_verse_id: number;
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number | null;
  verse_number: number | null;
  text_am: string | null;
  relation: string;
  weight: number;
  note_am: string | null;
};

/**
 * Topics this verse belongs to.
 * Uses the new /api/bible/{book}/{chapter}/{verse}/topics endpoint.
 */
export function useVerseTopics(
  bookSlug: string | null | undefined,
  chapter: number | null | undefined,
  verseNumber: number | null | undefined,
  opts?: { translation?: string },
) {
  const enabled =
    Boolean(bookSlug) &&
    typeof chapter === "number" &&
    typeof verseNumber === "number";

  return useQuery({
    enabled,
    queryKey: [
      ...discoveryKeys.all,
      "verse-topics",
      bookSlug ?? "",
      chapter ?? 0,
      verseNumber ?? 0,
      opts?.translation ?? "AMH1954",
    ],
    queryFn: () =>
      request<TopicOut[]>(
        `/api/bible/${bookSlug}/${chapter}/${verseNumber}/topics`,
        { query: { translation: opts?.translation ?? "AMH1954" } },
      ),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Cross-references FROM this verse TO other verses.
 */
export function useRelatedVerses(
  bookSlug: string | null | undefined,
  chapter: number | null | undefined,
  verseNumber: number | null | undefined,
  opts?: { translation?: string; enabled?: boolean },
) {
  const enabled =
    (opts?.enabled ?? true) &&
    Boolean(bookSlug) &&
    typeof chapter === "number" &&
    typeof verseNumber === "number";

  return useQuery({
    enabled,
    queryKey: [
      ...discoveryKeys.all,
      "verse-related",
      bookSlug ?? "",
      chapter ?? 0,
      verseNumber ?? 0,
      opts?.translation ?? "AMH1954",
    ],
    queryFn: () =>
      request<CrossReferenceOut[]>(
        `/api/bible/${bookSlug}/${chapter}/${verseNumber}/related`,
        { query: { translation: opts?.translation ?? "AMH1954" } },
      ),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Synoptic parallel passages (convenience wrapper around relation=parallel).
 */
export function useParallelVerses(
  bookSlug: string | null | undefined,
  chapter: number | null | undefined,
  verseNumber: number | null | undefined,
  opts?: { translation?: string; enabled?: boolean },
) {
  const enabled =
    (opts?.enabled ?? true) &&
    Boolean(bookSlug) &&
    typeof chapter === "number" &&
    typeof verseNumber === "number";

  return useQuery({
    enabled,
    queryKey: [
      ...discoveryKeys.all,
      "verse-parallel",
      bookSlug ?? "",
      chapter ?? 0,
      verseNumber ?? 0,
      opts?.translation ?? "AMH1954",
    ],
    queryFn: () =>
      request<CrossReferenceOut[]>(
        `/api/bible/${bookSlug}/${chapter}/${verseNumber}/parallel`,
        { query: { translation: opts?.translation ?? "AMH1954" } },
      ),
    staleTime: 60 * 60 * 1000,
  });
}
