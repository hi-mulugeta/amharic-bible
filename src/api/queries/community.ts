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
export type VoteTally = {
  commentary_id: number;
  upvotes: number;
  downvotes: number;
  score: number;
  my_vote: number | null;
};

export type CommentAuthor = {
  id: number;
  username: string;
  display_name_am: string | null;
};

export type CommentOut = {
  id: number;
  verse_id: number;
  parent_id: number | null;
  author: CommentAuthor | null;
  content_am: string;
  is_hidden: boolean;
  is_mine: boolean;
  created_at: string;
  updated_at: string;
  reply_count: number;
};

export type CommentAdminOut = CommentOut & {
  moderated_by: string | null;
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
export const communityKeys = {
  all: ["community"] as const,
  votes: (commentaryId: number) =>
    [...communityKeys.all, "votes", commentaryId] as const,
  commentsForVerse: (verseId: number, page: number) =>
    [...communityKeys.all, "comments", "verse", verseId, page] as const,
  replies: (commentId: number) =>
    [...communityKeys.all, "replies", commentId] as const,
  moderation: (page: number, onlyHidden: boolean) =>
    [...communityKeys.all, "moderation", page, onlyHidden] as const,
};

// ------------------------------------------------------------
// Votes
// ------------------------------------------------------------
export function useVoteTally(commentaryId: number | null) {
  return useQuery({
    enabled: commentaryId !== null,
    queryKey: communityKeys.votes(commentaryId ?? 0),
    queryFn: () =>
      request<VoteTally>(`/api/commentaries/${commentaryId}/votes`),
    staleTime: 30 * 1000,
  });
}

export function useCastVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentaryId,
      vote,
    }: {
      commentaryId: number;
      vote: number;
    }) =>
      request<VoteTally>(`/api/commentaries/${commentaryId}/vote`, {
        method: "POST",
        body: JSON.stringify({ vote }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: communityKeys.votes(variables.commentaryId),
      });
    },
  });
}

export function useRemoveVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentaryId: number) =>
      request<VoteTally>(`/api/commentaries/${commentaryId}/vote`, {
        method: "DELETE",
      }),
    onSuccess: (_data, commentaryId) => {
      qc.invalidateQueries({
        queryKey: communityKeys.votes(commentaryId),
      });
    },
  });
}

// ------------------------------------------------------------
// Comments
// ------------------------------------------------------------
export function useComments(verseId: number | null, opts?: { page?: number }) {
  const page = opts?.page ?? 1;
  return useQuery({
    enabled: verseId !== null,
    queryKey: communityKeys.commentsForVerse(verseId ?? 0, page),
    queryFn: () =>
      request<Paged<CommentOut>>(`/api/verses/${verseId}/comments`, {
        query: { page, per_page: 20 },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useReplies(commentId: number | null) {
  return useQuery({
    enabled: commentId !== null,
    queryKey: communityKeys.replies(commentId ?? 0),
    queryFn: () => request<CommentOut[]>(`/api/comments/${commentId}/replies`),
    staleTime: 30 * 1000,
  });
}

export function useCreateComment(verseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content_am: string; parent_id?: number | null }) =>
      request<CommentOut>(`/api/verses/${verseId}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      // Invalidate all comment queries for this verse
      qc.invalidateQueries({
        queryKey: [...communityKeys.all, "comments", "verse", verseId],
      });
      // If this was a reply, refresh the parent's replies too
      qc.invalidateQueries({
        queryKey: [...communityKeys.all, "replies"],
      });
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      content_am,
    }: {
      commentId: number;
      content_am: string;
    }) =>
      request<CommentOut>(`/api/comments/${commentId}`, {
        method: "PATCH",
        body: JSON.stringify({ content_am }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...communityKeys.all, "comments"] });
      qc.invalidateQueries({ queryKey: [...communityKeys.all, "replies"] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      request<void>(`/api/comments/${commentId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...communityKeys.all, "comments"] });
      qc.invalidateQueries({ queryKey: [...communityKeys.all, "replies"] });
    },
  });
}

// ------------------------------------------------------------
// Moderation (admin)
// ------------------------------------------------------------
export function useModerationQueue(opts?: {
  page?: number;
  onlyHidden?: boolean;
}) {
  const page = opts?.page ?? 1;
  const onlyHidden = opts?.onlyHidden ?? false;
  return useQuery({
    queryKey: communityKeys.moderation(page, onlyHidden),
    queryFn: () =>
      request<Paged<CommentAdminOut>>("/api/moderation/comments", {
        query: { page, per_page: 50, only_hidden: onlyHidden },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useHideComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      request<CommentAdminOut>(`/api/moderation/comments/${commentId}/hide`, {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...communityKeys.all, "moderation"] });
    },
  });
}

export function useUnhideComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      request<CommentAdminOut>(`/api/moderation/comments/${commentId}/unhide`, {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...communityKeys.all, "moderation"] });
    },
  });
}
