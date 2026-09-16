import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";
import type { TopicOut, TagOut, DiscoveryVerse } from "./discovery";
import type { SaintOut } from "./liturgy";

import type { AuthorOut } from "./authors";

// ------------------------------------------------------------
// Payload types
// ------------------------------------------------------------

export type TopicCreate = {
  slug: string;
  name_am: string;
  name_en?: string | null;
  description_am?: string | null;
  description_en?: string | null;
};

export type TopicUpdate = {
  name_am?: string;
  name_en?: string | null;
  description_am?: string | null;
  description_en?: string | null;
};

export type TagCreate = {
  slug: string;
  name_am: string;
  name_en?: string | null;
};

export type SaintCreate = {
  slug: string;
  name_am: string;
  name_en?: string | null;
  title_am?: string | null;
  short_bio_am?: string | null;
  long_bio_am?: string | null;
  image_url?: string | null;
  ethiopian_month: number;
  ethiopian_day: number;
  is_feast?: boolean;
};

export type SaintUpdate = Partial<Omit<SaintCreate, "slug">> & {
  name_am?: string;
};

export type DeleteResult = {
  deleted: boolean;
  id?: number | null;
  note?: string | null;
};

// ------------------------------------------------------------
// Topics
// ------------------------------------------------------------

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TopicCreate) =>
      request<{ id: number; slug: string }>("/api/admin/discovery/topics", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", "topics"] });
    },
  });
}

export function useUpdateTopic(topicId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TopicUpdate) =>
      request<{ id: number; updated: boolean }>(
        `/api/admin/discovery/topics/${topicId}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", "topics"] });
      if (topicId) qc.invalidateQueries({ queryKey: ["discovery", "topic"] });
    },
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (topicId: number) =>
      request<DeleteResult>(`/api/admin/discovery/topics/${topicId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", "topics"] });
    },
  });
}

export function useAttachVersesToTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      topicId,
      verseIds,
      rank,
    }: {
      topicId: number;
      verseIds: number[];
      rank?: number;
    }) =>
      request<{ topic_id: number; added: number; already_present: number }>(
        `/api/admin/discovery/topics/${topicId}/verses`,
        {
          method: "POST",
          body: JSON.stringify({ verse_ids: verseIds, rank: rank ?? 0 }),
        },
      ),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["discovery", "topic-verses", variables.topicId],
      });
    },
  });
}

export function useDetachVerseFromTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, verseId }: { topicId: number; verseId: number }) =>
      request<DeleteResult>(
        `/api/admin/discovery/topics/${topicId}/verses/${verseId}`,
        { method: "DELETE" },
      ),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["discovery", "topic-verses", variables.topicId],
      });
    },
  });
}

// ------------------------------------------------------------
// Tags
// ------------------------------------------------------------

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TagCreate) =>
      request<TagOut>("/api/admin/discovery/tags", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", "tags"] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: number) =>
      request<DeleteResult>(`/api/admin/discovery/tags/${tagId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", "tags"] });
    },
  });
}

export function useAttachTagToVerse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookSlug,
      chapter,
      verseNumber,
      tagSlugs,
    }: {
      bookSlug: string;
      chapter: number;
      verseNumber: number;
      tagSlugs: string[];
    }) =>
      request<{ verse_id: number; added: number; already_present: number }>(
        `/api/admin/discovery/bible/${bookSlug}/${chapter}/${verseNumber}/tags`,
        {
          method: "POST",
          body: JSON.stringify({ tag_slugs: tagSlugs }),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", "verse-tags"] });
      qc.invalidateQueries({ queryKey: ["discovery", "tag-verses"] });
    },
  });
}

export function useDetachTagFromVerse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookSlug,
      chapter,
      verseNumber,
      tagSlug,
    }: {
      bookSlug: string;
      chapter: number;
      verseNumber: number;
      tagSlug: string;
    }) =>
      request<DeleteResult>(
        `/api/admin/discovery/bible/${bookSlug}/${chapter}/${verseNumber}/tags/${tagSlug}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", "verse-tags"] });
      qc.invalidateQueries({ queryKey: ["discovery", "tag-verses"] });
    },
  });
}

// ------------------------------------------------------------
// Saints
// ------------------------------------------------------------

export function useCreateSaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaintCreate) =>
      request<SaintOut>("/api/admin/liturgy/saints", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liturgy", "saints"] });
    },
  });
}

export function useUpdateSaint(saintId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaintUpdate) =>
      request<SaintOut>(`/api/admin/liturgy/saints/${saintId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liturgy", "saints"] });
    },
  });
}

export function useDeleteSaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (saintId: number) =>
      request<DeleteResult>(`/api/admin/liturgy/saints/${saintId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liturgy", "saints"] });
    },
  });
}

// ------------------------------------------------------------
// Helper: invalidate everything after any admin write.
// Some mutations touch shared caches (e.g., verse tags appear in the reader).
// ------------------------------------------------------------

export function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["discovery"] });
    qc.invalidateQueries({ queryKey: ["liturgy"] });
  };
}
// ============================================================
// Authors
// ============================================================

export type AuthorCreate = {
  slug: string;
  name_am: string;
  name_en?: string | null;
  name_original?: string | null;
  era?: string | null;
  birth_year?: number | null;
  death_year?: number | null;
  bio_am?: string | null;
  bio_en?: string | null;
  image_url?: string | null;
  ethiopian_venerated?: boolean;
};

export type AuthorUpdate = Partial<Omit<AuthorCreate, "slug">>;

export function useCreateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AuthorCreate) =>
      request<AuthorOut>("/api/admin/authors", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

export function useUpdateAuthor(authorId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AuthorUpdate) =>
      request<AuthorOut>(`/api/admin/authors/${authorId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

export function useDeleteAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      authorId,
      force = false,
    }: {
      authorId: number;
      force?: boolean;
    }) =>
      request<DeleteResult>(`/api/admin/authors/${authorId}`, {
        method: "DELETE",
        query: force ? { force: true } : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

// ============================================================
// Commentary sources
// ============================================================

export type SourceCreate = {
  title_am: string;
  title_en?: string | null;
  author_id?: number | null;
  source_type?: string | null;
  original_language?: string | null;
  translator_am?: string | null;
  publication_info?: string | null;
};

export type SourceUpdate = Partial<SourceCreate>;

export type SourceOut = {
  id: number;
  title_am: string;
  title_en: string | null;
  author_id: number | null;
  author_name_am?: string | null;
  source_type: string | null;
  original_language: string | null;
  translator_am: string | null;
};

export function useCreateSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SourceCreate) =>
      request<SourceOut>("/api/admin/commentary-sources", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commentaries", "sources"] });
    },
  });
}

export function useUpdateSource(sourceId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SourceUpdate) =>
      request<SourceOut>(`/api/admin/commentary-sources/${sourceId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commentaries", "sources"] });
    },
  });
}

export function useDeleteSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sourceId,
      force = false,
    }: {
      sourceId: number;
      force?: boolean;
    }) =>
      request<DeleteResult>(`/api/admin/commentary-sources/${sourceId}`, {
        method: "DELETE",
        query: force ? { force: true } : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commentaries", "sources"] });
    },
  });
}

// ============================================================
// Commentaries
// ============================================================

export type CommentaryCreate = {
  verse_id: number;
  author_id?: number | null;
  source_id?: number | null;
  content_am: string;
  content_original?: string | null;
  excerpt_am?: string | null;
  is_verified?: boolean;
};

export type CommentaryUpdate = Partial<Omit<CommentaryCreate, "verse_id">>;

export type CommentaryBulkCreate = {
  book_slug: string;
  chapter: number;
  translation_code?: string;
  author_slug?: string | null;
  source_id?: number | null;
  is_verified?: boolean;
  commentaries: Array<{
    verse: number;
    content_am: string;
    excerpt_am?: string | null;
  }>;
};

export type AdminCommentaryOut = {
  id: number;
  verse_id: number;
  author: {
    id: number;
    slug: string;
    name_am: string;
    name_en: string | null;
  } | null;
  source: string | null;
  content_am: string;
  excerpt_am: string | null;
  word_count: number | null;
};

export function useAdminCommentaries(opts?: {
  page?: number;
  perPage?: number;
  authorId?: number;
  sourceId?: number;
  isVerified?: boolean;
}) {
  const page = opts?.page ?? 1;
  return useQuery({
    queryKey: [
      "admin",
      "commentaries",
      page,
      opts?.authorId ?? "",
      opts?.sourceId ?? "",
      opts?.isVerified ?? "any",
    ] as const,
    queryFn: () =>
      request<{
        data: AdminCommentaryOut[];
        meta: {
          page: number;
          per_page: number;
          total: number;
          pages: number;
          has_next: boolean;
          has_prev: boolean;
        };
      }>("/api/admin/commentaries", {
        query: {
          page,
          per_page: opts?.perPage ?? 50,
          author_id: opts?.authorId,
          source_id: opts?.sourceId,
          is_verified: opts?.isVerified,
        },
      }),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
}

export function useCreateCommentary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommentaryCreate) =>
      request<AdminCommentaryOut>("/api/admin/commentaries", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "commentaries"] });
      qc.invalidateQueries({ queryKey: ["commentaries", "verse"] });
    },
  });
}

export function useBulkCreateCommentaries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommentaryBulkCreate) =>
      request<{
        created: number;
        skipped: number;
        book: string;
        chapter: number;
        author_slug: string | null;
        is_verified: boolean;
      }>("/api/admin/commentaries/bulk", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "commentaries"] });
      qc.invalidateQueries({ queryKey: ["commentaries", "verse"] });
      qc.invalidateQueries({ queryKey: ["bible"] });
    },
  });
}

export function useUpdateCommentary(commentaryId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommentaryUpdate) =>
      request<AdminCommentaryOut>(`/api/admin/commentaries/${commentaryId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "commentaries"] });
      qc.invalidateQueries({ queryKey: ["commentaries", "verse"] });
    },
  });
}

export function useDeleteCommentary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentaryId: number) =>
      request<DeleteResult>(`/api/admin/commentaries/${commentaryId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "commentaries"] });
      qc.invalidateQueries({ queryKey: ["commentaries", "verse"] });
    },
  });
}
