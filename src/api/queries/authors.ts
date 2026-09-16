import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { request } from "@/api/client";

// ---------- Types ----------

export type AuthorOut = {
  id: number;
  slug: string;
  name_am: string;
  name_en: string | null;
  era: string | null;
  birth_year: number | null;
  death_year: number | null;
  bio_am: string | null;
  bio_en: string | null;
  image_url: string | null;
  ethiopian_venerated: boolean;
};

export type AuthorWork = {
  id: number;
  title_am: string;
  title_en: string | null;
  source_type: string | null;
  original_language: string | null;
  commentary_count: number;
};

export type AuthorVerse = {
  verse_id: number;
  book_slug: string;
  book_name_am: string;
  chapter: number;
  verse_number: number;
  text_am: string;
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

export const authorKeys = {
  all: ["authors"] as const,
  list: (page: number, era?: string, ethiopianVenerated?: boolean) =>
    [
      ...authorKeys.all,
      "list",
      page,
      era ?? "",
      ethiopianVenerated ?? "any",
    ] as const,
  detail: (slug: string) => [...authorKeys.all, "detail", slug] as const,
  works: (slug: string) => [...authorKeys.all, "works", slug] as const,
  verses: (slug: string, page: number) =>
    [...authorKeys.all, "verses", slug, page] as const,
};

// ---------- Hooks ----------

export function useAuthors(opts?: {
  page?: number;
  perPage?: number;
  era?: string;
  ethiopianVenerated?: boolean;
}) {
  const page = opts?.page ?? 1;
  return useQuery({
    queryKey: authorKeys.list(page, opts?.era, opts?.ethiopianVenerated),
    queryFn: () =>
      request<Paged<AuthorOut>>("/api/commentaries/authors", {
        query: {
          page,
          per_page: opts?.perPage ?? 24,
          era: opts?.era,
          ethiopian_venerated: opts?.ethiopianVenerated,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000, // 1 hour — authors rarely change
  });
}

export function useAuthor(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: authorKeys.detail(slug ?? ""),
    queryFn: () => request<AuthorOut>(`/api/commentaries/authors/${slug}`),
    staleTime: 60 * 60 * 1000,
  });
}

export function useAuthorWorks(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: authorKeys.works(slug ?? ""),
    queryFn: () =>
      request<AuthorWork[]>(`/api/commentaries/authors/${slug}/works`),
    staleTime: 60 * 60 * 1000,
  });
}

export function useAuthorVerses(
  slug: string | undefined,
  opts?: { page?: number },
) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: Boolean(slug),
    queryKey: authorKeys.verses(slug ?? "", page),
    queryFn: () =>
      request<Paged<AuthorVerse>>(`/api/commentaries/authors/${slug}/verses`, {
        query: { page, per_page: 30 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });
}
