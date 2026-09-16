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

export type CommentaryOut = {
  id: number;
  author: AuthorOut | null;
  source: string | null;
  content_am: string;
  excerpt_am: string | null;
  word_count: number | null;
};

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type VerseCommentariesOut = {
  verse: {
    id: number;
    book: string;
    book_name_am: string;
    chapter: number;
    verse_number: number;
    verse_number_ethiopic: string;
    text_am: string;
  };
  commentaries: CommentaryOut[];
  pagination: Pagination;
};

// ---------- Keys ----------

export const commentaryKeys = {
  all: ["commentaries"] as const,
  forVerse: (
    verseId: number,
    page: number,
    authorSlug?: string,
    era?: string,
  ) =>
    [
      ...commentaryKeys.all,
      "verse",
      verseId,
      page,
      authorSlug ?? "",
      era ?? "",
    ] as const,
};

// ---------- Hooks ----------

export function useCommentariesForVerse(
  verseId: number | null,
  opts?: { page?: number; authorSlug?: string; era?: string },
) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: verseId !== null,
    queryKey: commentaryKeys.forVerse(
      verseId ?? 0,
      page,
      opts?.authorSlug,
      opts?.era,
    ),
    queryFn: () =>
      request<VerseCommentariesOut>(`/api/commentaries/verse/${verseId}`, {
        query: {
          page,
          per_page: 20,
          author_slug: opts?.authorSlug,
          era: opts?.era,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
