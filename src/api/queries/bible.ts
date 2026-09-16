import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";

// ---------- Types ----------

export type TranslationOut = {
  id: number;
  code: string;
  name_am: string;
  name_en: string | null;
  language: string;
  script: string;
};

export type BookOut = {
  id: number;
  slug: string;
  name_am: string;
  name_am_full: string | null;
  name_en: string;
  abbreviation_am: string | null;
  testament: "OT" | "NT";
  position: number;
  total_chapters: number;
  is_deuterocanonical: boolean;
  ethiopian_only: boolean;
  position_ethiopic: string | null;
};

export type VerseOut = {
  id: number;
  book: string | null;
  book_name_am: string | null;
  chapter: number;
  verse_number: number;
  text_am: string;
  verse_number_ethiopic: string | null;
  chapter_ethiopic: string | null;
  commentary_count?: number | null;
};

export type ChapterOut = {
  book: BookOut;
  chapter: number;
  chapter_ethiopic: string | null;
  translation: TranslationOut;
  verses: VerseOut[];
};

export type NavigationOut = {
  current: { book_slug: string; chapter: number };
  previous: { book_slug: string; chapter: number } | null;
  next: { book_slug: string; chapter: number } | null;
};

// ---------- Keys ----------

export const bibleKeys = {
  all: ["bible"] as const,
  books: (testament?: "OT" | "NT", includeDeutero = true) =>
    [...bibleKeys.all, "books", testament ?? "all", includeDeutero] as const,
  book: (slug: string) => [...bibleKeys.all, "book", slug] as const,
  chapter: (book: string, chapter: number, translation: string) =>
    [...bibleKeys.all, "chapter", book, chapter, translation] as const,
  navigation: (book: string, chapter: number) =>
    [...bibleKeys.all, "nav", book, chapter] as const,
  translations: () => [...bibleKeys.all, "translations"] as const,
};

// ---------- Hooks ----------

export function useBooks(testament?: "OT" | "NT") {
  return useQuery({
    queryKey: bibleKeys.books(testament),
    queryFn: () =>
      request<{ books: BookOut[] }>("/api/bible/books", {
        query: { testament, include_deuterocanonical: true },
      }),
    select: (data) => data.books,
    staleTime: 60 * 60 * 1000, // books rarely change — 1 hour
  });
}

export function useTranslations() {
  return useQuery({
    queryKey: bibleKeys.translations(),
    queryFn: () => request<TranslationOut[]>("/api/bible/translations"),
    staleTime: 60 * 60 * 1000,
  });
}

export function useChapter(
  book: string | undefined,
  chapter: number | undefined,
  translation: string,
) {
  return useQuery({
    enabled: Boolean(book && chapter && Number.isFinite(chapter)),
    queryKey: bibleKeys.chapter(book ?? "", chapter ?? 0, translation),
    queryFn: () =>
      request<ChapterOut>(`/api/bible/${book}/${chapter}`, {
        query: { translation, with_counts: true },
      }),
    // Keep the previous chapter on screen while the next one loads —
    // this is what makes navigation feel instant.
    placeholderData: (prev) => prev,
  });
}

export function useNavigation(
  book: string | undefined,
  chapter: number | undefined,
) {
  return useQuery({
    enabled: Boolean(book && chapter),
    queryKey: bibleKeys.navigation(book ?? "", chapter ?? 0),
    queryFn: () =>
      request<NavigationOut>(`/api/bible/${book}/${chapter}/navigation`),
    staleTime: 60 * 60 * 1000,
  });
}
/** Fetch every book regardless of testament. Returns the flat list. */
export function useAllBooks() {
  return useQuery({
    queryKey: bibleKeys.books(undefined, true),
    queryFn: () =>
      request<{ books: BookOut[] }>('/api/bible/books', {
        query: { include_deuterocanonical: true },
      }),
    select: (data) => data.books,
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * All books, grouped into the three canonical sections:
 *   OT      — Old Testament (canonical)
 *   DEUTERO — Deuterocanonical (Enoch, Jubilees, Meqabyan, etc.)
 *   NT      — New Testament
 */
export function useGroupedBooks() {
  const query = useAllBooks()

  const groups = {
    OT: [] as BookOut[],
    DEUTERO: [] as BookOut[],
    NT: [] as BookOut[],
  }

  for (const b of query.data ?? []) {
    if (b.is_deuterocanonical) groups.DEUTERO.push(b)
    else if (b.testament === 'OT') groups.OT.push(b)
    else groups.NT.push(b)
  }

  return { ...query, groups }
}
