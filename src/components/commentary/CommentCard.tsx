import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Pencil, Trash2, X, Check } from "lucide-react";
import {
  useReplies,
  useDeleteComment,
  useUpdateComment,
  type CommentOut,
} from "@/api/queries/community";
import { CommentComposer } from "./CommentComposer";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "አሁን";
  if (diffMin < 60) return `ከ ${diffMin} ደቂቃ በፊት`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `ከ ${diffHr} ሰዓት በፊት`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `ከ ${diffDay} ቀን በፊት`;
  return new Date(iso).toLocaleDateString();
}

export function CommentCard({
  comment,
  isReply = false,
}: {
  comment: CommentOut;
  isReply?: boolean;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content_am);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useUpdateComment();
  const deleteMutation = useDeleteComment();

  const repliesQuery = useReplies(
    expandedReplies && !isReply ? comment.id : null,
  );

  const authorName =
    comment.author?.display_name_am ?? comment.author?.username ?? "ተጠቃሚ";

  const handleSave = async () => {
    setError(null);
    if (!draft.trim()) {
      setError("አስተያየቱ ባዶ ነው");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        commentId: comment.id,
        content_am: draft.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  return (
    <div className={cn("space-y-3", isReply && "ml-8")}>
      <div className="rounded-xl border border-surface-border bg-surface-raised/10 p-4">
        {/* Header */}
        <header className="mb-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            <span className="font-amharic font-medium text-text-secondary">
              {authorName}
            </span>
            <span className="text-text-faint">·</span>
            <span>{relativeTime(comment.updated_at)}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-[11px] text-text-faint italic">
                (ተስተካክሏል)
              </span>
            )}
            {comment.is_hidden && (
              <span className="rounded-sm bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-400">
                ተደብቋል
              </span>
            )}
          </div>

          {comment.is_mine && !editing && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setDraft(comment.content_am);
                  setEditing(true);
                }}
                className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-surface-raised hover:text-text-primary"
                aria-label="አርትዕ"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <ConfirmButton
                onConfirm={() => deleteMutation.mutate(comment.id)}
                busy={deleteMutation.isPending}
              >
                <Trash2 className="inline h-3 w-3" />
              </ConfirmButton>
            </div>
          )}
        </header>

        {/* Body */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              autoFocus
              className={cn(
                "w-full rounded-lg border border-surface-border bg-surface-sunken/50",
                "px-3 py-2 font-amharic text-[14px] leading-[1.8] text-text-primary",
                "resize-none focus:border-gold-500/40 focus:outline-none",
              )}
            />
            {error && (
              <p className="font-amharic text-[12px] text-red-400">{error}</p>
            )}
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.content_am);
                  setError(null);
                }}
                className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                aria-label="ሰርዝ"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="rounded-md p-1.5 text-gold-500 transition-colors hover:bg-gold-500/10"
                aria-label="አስቀምጥ"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <p className="font-amharic text-[14px] leading-[1.85] text-text-secondary whitespace-pre-line">
            {comment.content_am}
          </p>
        )}

        {/* Actions row */}
        {!isReply && !editing && (
          <div className="mt-3 flex items-center gap-3 text-[12px]">
            <button
              type="button"
              onClick={() => setShowReplyBox((v) => !v)}
              className="font-amharic text-text-muted transition-colors hover:text-gold-400"
            >
              መልስ
            </button>
            {comment.reply_count > 0 && (
              <button
                type="button"
                onClick={() => setExpandedReplies((v) => !v)}
                className="inline-flex items-center gap-1 font-amharic text-text-muted transition-colors hover:text-gold-400"
              >
                <MessageCircle className="h-3 w-3" />
                {comment.reply_count} መልሶች
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply composer */}
      {showReplyBox && !isReply && (
        <div className="ml-8">
          <CommentComposer
            verseId={comment.verse_id}
            parentId={comment.id}
            placeholder="መልስዎን ይጻፉ..."
            autoFocus
            compact
            onDone={() => {
              setShowReplyBox(false);
              setExpandedReplies(true);
            }}
          />
        </div>
      )}

      {/* Replies */}
      {expandedReplies && !isReply && (
        <div className="space-y-3">
          {repliesQuery.isLoading ? (
            <p className="ml-8 py-2 font-amharic text-[12px] text-text-faint">
              በመጫን ላይ...
            </p>
          ) : repliesQuery.data && repliesQuery.data.length > 0 ? (
            repliesQuery.data.map((reply) => (
              <CommentCard key={reply.id} comment={reply} isReply />
            ))
          ) : null}
        </div>
      )}
    </div>
  );
}
