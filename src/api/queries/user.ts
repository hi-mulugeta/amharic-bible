import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";

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

/**
 * "Continue reading" — the most recent chapter the user opened.
 *
 * Auth isn't wired yet, so this hook is disabled until we set
 * `enabled: true` from an auth context. When auth lands, this flips on
 * automatically. Until then, the section simply doesn't render.
 */
export function useContinueReading(opts?: { enabled?: boolean }) {
  return useQuery({
    enabled: opts?.enabled ?? false,
    queryKey: ["users", "me", "history", "continue"],
    queryFn: () => request<HistoryOut | null>("/api/users/me/history/continue"),
    staleTime: 60 * 1000,
  });
}
