import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { request, ApiRequestError } from "@/api/client";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
const deleteAttempts = new Set<number>();
export type HistoryOut = {
  id: number;
  book_id: number;
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number;
  first_seen_at: string;
  last_seen_at: string;
  visit_count: number;
};

export type BookmarkOut = {
  id: number;
  verse_id: number;
  note_am: string | null;
  created_at: string;
  // Enriched verse reference (from the backend)
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number | null;
  verse_number: number | null;
  text_am: string | null;
};

export type NoteOut = {
  id: number;
  verse_id: number;
  content_am: string;
  color: string;
  created_at: string;
  updated_at: string;
  // Enriched verse reference
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number | null;
  verse_number: number | null;
  text_am: string | null;
};

export type HighlightOut = {
  id: number;
  book_id: number;
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number;
  start_verse: number;
  end_verse: number;
  color: string;
  created_at: string;
};

export type UserStats = {
  bookmarks: number;
  notes: number;
  highlights: number;
  chapters_read: number;
  distinct_books_read: number;
  current_streak_days: number;
  longest_streak_days: number;
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

// ------------------------------------------------------------
// Keys
// ------------------------------------------------------------

export const userKeys = {
  all: ["users", "me"] as const,
  history: (page: number) => [...userKeys.all, "history", page] as const,
  historyContinue: () => [...userKeys.all, "history", "continue"] as const,
  bookmarks: (page: number) => [...userKeys.all, "bookmarks", page] as const,
  bookmarksForVerse: (verseId: number) =>
    [...userKeys.all, "bookmarks", "verse", verseId] as const,
  notes: (page: number, verseId?: number) =>
    [...userKeys.all, "notes", page, verseId ?? "all"] as const,
  notesForVerse: (verseId: number) =>
    [...userKeys.all, "notes", "verse", verseId] as const,
  highlights: (page: number, bookSlug?: string) =>
    [...userKeys.all, "highlights", page, bookSlug ?? "all"] as const,
  highlightsForChapter: (bookSlug: string, chapter: number) =>
    [...userKeys.all, "highlights", "chapter", bookSlug, chapter] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// ------------------------------------------------------------
// History
// ------------------------------------------------------------

export function useContinueReading(opts?: { enabled?: boolean }) {
  return useQuery({
    enabled: opts?.enabled ?? false,
    queryKey: userKeys.historyContinue(),
    queryFn: () => request<HistoryOut | null>("/api/users/me/history/continue"),
    staleTime: 60 * 1000,
  });
}

export function useHistory(opts?: { page?: number; enabled?: boolean }) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: opts?.enabled ?? true,
    queryKey: userKeys.history(page),
    queryFn: () =>
      request<Paged<HistoryOut>>("/api/users/me/history", {
        query: { page, per_page: 30 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function usePingHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { book_slug: string; chapter: number }) =>
      request<HistoryOut>("/api/users/me/history", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...userKeys.all, "history"] });
    },
  });
}

// ------------------------------------------------------------
// Bookmarks
// ------------------------------------------------------------

export function useBookmarks(opts?: { page?: number; enabled?: boolean }) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: opts?.enabled ?? true,
    queryKey: userKeys.bookmarks(page),
    queryFn: () =>
      request<Paged<BookmarkOut>>("/api/users/me/bookmarks", {
        query: { page, per_page: 30 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/**
 * All bookmarks for a specific verse. Used to determine whether a verse
 * is currently bookmarked and to know which bookmark id to delete.
 */
export function useBookmarksForVerse(
  verseId: number | null,
  opts?: { enabled?: boolean },
) {
  return useQuery({
    enabled: (opts?.enabled ?? true) && verseId !== null,
    queryKey: userKeys.bookmarksForVerse(verseId ?? 0),
    queryFn: () =>
      request<Paged<BookmarkOut>>("/api/users/me/bookmarks", {
        query: { page: 1, per_page: 50 },
      }),
    select: (data) => data.data.filter((b) => b.verse_id === verseId),
    staleTime: 60 * 1000,
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { verseId: number; existingId?: number }) => {
      if (args.existingId) {
        await request<void>(`/api/users/me/bookmarks/${args.existingId}`, {
          method: "DELETE",
        });
        return { action: "deleted" as const };
      }
      const created = await request<BookmarkOut>("/api/users/me/bookmarks", {
        method: "POST",
        body: JSON.stringify({ verse_id: args.verseId }),
      });
      return { action: "created" as const, bookmark: created };
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: userKeys.bookmarksForVerse(variables.verseId),
      });
      qc.invalidateQueries({ queryKey: [...userKeys.all, "bookmarks"] });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

// ------------------------------------------------------------
// Notes
// ------------------------------------------------------------

export function useNotes(opts?: {
  page?: number;
  verseId?: number;
  enabled?: boolean;
}) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: opts?.enabled ?? true,
    queryKey: userKeys.notes(page, opts?.verseId),
    queryFn: () =>
      request<Paged<NoteOut>>("/api/users/me/notes", {
        query: { page, per_page: 30, verse_id: opts?.verseId },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useNotesForVerse(
  verseId: number | null,
  opts?: { enabled?: boolean },
) {
  return useQuery({
    enabled: (opts?.enabled ?? true) && verseId !== null,
    queryKey: userKeys.notesForVerse(verseId ?? 0),
    queryFn: () =>
      request<Paged<NoteOut>>("/api/users/me/notes", {
        query: { page: 1, per_page: 50, verse_id: verseId ?? undefined },
      }),
    select: (data) => data.data,
    staleTime: 60 * 1000,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      verse_id: number;
      content_am: string;
      color?: string;
    }) =>
      request<NoteOut>("/api/users/me/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: userKeys.notesForVerse(variables.verse_id),
      });
      qc.invalidateQueries({ queryKey: [...userKeys.all, "notes"] });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: number;
      verseId: number;
      content_am?: string;
      color?: string;
    }) =>
      request<NoteOut>(`/api/users/me/notes/${args.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          content_am: args.content_am,
          color: args.color,
        }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: userKeys.notesForVerse(variables.verseId),
      });
      qc.invalidateQueries({ queryKey: [...userKeys.all, "notes"] });
    },
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      request<void>(`/api/users/me/bookmarks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...userKeys.all, "bookmarks"] });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; verseId: number }) =>
      request<void>(`/api/users/me/notes/${args.id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...userKeys.all, "notes"] });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}
// ------------------------------------------------------------
// Highlights
// ------------------------------------------------------------

export function useHighlights(opts?: {
  page?: number;
  bookSlug?: string;
  enabled?: boolean;
}) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: opts?.enabled ?? true,
    queryKey: userKeys.highlights(page, opts?.bookSlug),
    queryFn: () =>
      request<Paged<HighlightOut>>("/api/users/me/highlights", {
        query: { page, per_page: 30, book_slug: opts?.bookSlug },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
export function useHighlightsForChapter(
  bookSlug: string | null | undefined,
  chapter: number | null | undefined,
  opts?: { enabled?: boolean },
) {
  return useQuery({
    enabled:
      (opts?.enabled ?? true) &&
      Boolean(bookSlug) &&
      typeof chapter === "number",
    queryKey: userKeys.highlightsForChapter(bookSlug ?? "", chapter ?? 0),
    queryFn: () =>
      request<Paged<HighlightOut>>("/api/users/me/highlights", {
        query: { page: 1, per_page: 100, book_slug: bookSlug ?? undefined },
      }),
    select: (data) =>
      data.data.filter((h) => Number(h.chapter) === Number(chapter)),
    staleTime: 0, // ← changed from 60_000
  });
}
export function useCreateHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      book_slug: string;
      chapter: number;
      start_verse: number;
      end_verse: number;
      color?: string;
    }) =>
      request<HighlightOut>("/api/users/me/highlights", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      // Invalidate the specific chapter query that observers are watching
      qc.invalidateQueries({
        queryKey: userKeys.highlightsForChapter(
          variables.book_slug,
          variables.chapter,
        ),
      });
      // And the broader lists (Library page etc.)
      qc.invalidateQueries({ queryKey: [...userKeys.all, "highlights"] });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useDeleteHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // If we already tried this id, don't try again this session.
      // Prevents infinite loops when a stale id stays in cache.
      if (deleteAttempts.has(id)) {
        return;
      }
      deleteAttempts.add(id);

      try {
        await request<void>(`/api/users/me/highlights/${id}`, {
          method: "DELETE",
        });
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) {
          return;
        }
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...userKeys.all, "highlights"] });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}
// ------------------------------------------------------------
// Stats
// ------------------------------------------------------------

export function useUserStats(opts?: { enabled?: boolean }) {
  return useQuery({
    enabled: opts?.enabled ?? true,
    queryKey: userKeys.stats(),
    queryFn: () => request<UserStats>("/api/users/me/stats"),
    staleTime: 30 * 1000,
  });
}
// ------------------------------------------------------------
// Combined verse state — bookmarks + notes for one verse
// ------------------------------------------------------------

export type VerseState = {
  isBookmarked: boolean;
  bookmarkId: number | null;
  note: NoteOut | null;
};

/**
 * Fetches bookmark + note state for a single verse in one shot.
 * Both queries are cheap and cached, so this composes cleanly.
 */
export function useVerseState(
  verseId: number | null,
  opts?: { enabled?: boolean },
) {
  const enabled = (opts?.enabled ?? true) && verseId !== null;

  const bookmarks = useBookmarksForVerse(verseId, { enabled });
  const notes = useNotesForVerse(verseId, { enabled });

  return {
    isBookmarked: Boolean(bookmarks.data?.length),
    bookmarkId: bookmarks.data?.[0]?.id ?? null,
    note: notes.data?.[0] ?? null,
    isLoading: bookmarks.isLoading || notes.isLoading,
  };
}
/**
 * Given a list of highlights for a chapter, return a Map<verse_number, color>
 * for quick lookup during render.
 */
export function highlightColorForVerse(
  highlights: HighlightOut[] | undefined,
  verseNumber: number,
): string | null {
  if (!highlights) return null;
  for (const h of highlights) {
    if (h.start_verse <= verseNumber && h.end_verse >= verseNumber) {
      return h.color;
    }
  }
  return null;
}
