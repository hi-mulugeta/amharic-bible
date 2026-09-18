import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/client";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export type ChapterAudioOut = {
  id: number;
  translation_code: string | null;
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number;
  start_verse: number | null;
  end_verse: number | null;
  url: string;
  format: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  reciter_name_am: string | null;
  reciter_name_en: string | null;
  source_am: string | null;
  notes_am: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type ChapterAudioCreate = {
  translation_code?: string;
  book_slug: string;
  chapter: number;
  start_verse?: number | null;
  end_verse?: number | null;
  url: string;
  format?: string;
  duration_seconds?: number | null;
  file_size_bytes?: number | null;
  reciter_name_am?: string | null;
  reciter_name_en?: string | null;
  source_am?: string | null;
  notes_am?: string | null;
  is_published?: boolean;
};

export type ChapterAudioUpdate = Partial<
  Omit<ChapterAudioCreate, "book_slug" | "chapter">
>;

export type PageMeta = {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

// ------------------------------------------------------------
// Public queries
// ------------------------------------------------------------
export function useChapterAudio(
  bookSlug: string | null | undefined,
  chapter: number | null | undefined,
  translation = "AMH1954",
) {
  return useQuery({
    enabled: Boolean(bookSlug) && typeof chapter === "number",
    queryKey: ["audio", "chapter", bookSlug ?? "", chapter ?? 0, translation],
    queryFn: () =>
      request<ChapterAudioOut | null>(`/api/audio/${bookSlug}/${chapter}`, {
        query: { translation },
      }),
    staleTime: 60 * 60 * 1000,
  });
}

export function useChaptersWithAudio(
  bookSlug: string | null | undefined,
  translation = "AMH1954",
) {
  return useQuery({
    enabled: Boolean(bookSlug),
    queryKey: ["audio", "chapters-with-audio", bookSlug ?? "", translation],
    queryFn: () =>
      request<number[]>(`/api/audio/books/${bookSlug}/chapters-with-audio`, {
        query: { translation },
      }),
    staleTime: 60 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Admin queries
// ------------------------------------------------------------
export function useAdminAudioList(opts?: {
  page?: number;
  perPage?: number;
  bookSlug?: string;
}) {
  const page = opts?.page ?? 1;
  return useQuery({
    queryKey: ["admin", "audio", page, opts?.bookSlug ?? ""],
    queryFn: () =>
      request<{ data: ChapterAudioOut[]; meta: PageMeta }>("/api/admin/audio", {
        query: {
          page,
          per_page: opts?.perPage ?? 100,
          book_slug: opts?.bookSlug,
        },
      }),
    staleTime: 30 * 1000,
  });
}

export function useCreateAudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChapterAudioCreate) =>
      request<ChapterAudioOut>("/api/admin/audio", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "audio"] });
      qc.invalidateQueries({ queryKey: ["audio"] });
    },
  });
}

export function useUpdateAudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ChapterAudioUpdate;
    }) =>
      request<ChapterAudioOut>(`/api/admin/audio/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "audio"] });
      qc.invalidateQueries({ queryKey: ["audio"] });
    },
  });
}

export function useDeleteAudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      request<{ deleted: boolean; id: number }>(`/api/admin/audio/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "audio"] });
      qc.invalidateQueries({ queryKey: ["audio"] });
    },
  });
}
