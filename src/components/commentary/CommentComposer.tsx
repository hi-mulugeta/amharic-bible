import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useCreateComment } from "@/api/queries/community";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

type Props = {
  verseId: number;
  parentId?: number | null;
  placeholder?: string;
  autoFocus?: boolean;
  onDone?: () => void;
  compact?: boolean;
};

const textareaClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/50",
  "px-3 py-2.5",
  "font-amharic text-[15px] leading-[1.9] text-text-primary placeholder:text-text-faint",
  "transition-colors resize-none",
  "focus:border-gold-500/40 focus:bg-surface-sunken/70 focus:outline-none",
);

export function CommentComposer({
  verseId,
  parentId = null,
  placeholder = "አስተያየትዎን ይጻፉ...",
  autoFocus = false,
  onDone,
  compact = false,
}: Props) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const createMutation = useCreateComment(verseId);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() =>
          navigate(
            `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          )
        }
        className="w-full rounded-lg border border-dashed border-surface-border bg-surface-raised/10 px-4 py-3 text-left font-amharic text-[14px] text-text-muted transition-colors hover:border-gold-500/30 hover:bg-surface-raised/20 hover:text-text-secondary"
      >
        አስተያየት ለመስጠት ይግቡ →
      </button>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setError("አስተያየቱ ባዶ ነው");
      return;
    }
    try {
      await createMutation.mutateAsync({
        content_am: trimmed,
        parent_id: parentId,
      });
      setContent("");
      onDone?.();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={compact ? 2 : 3}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={textareaClass}
      />
      {error && (
        <p className="font-amharic text-[12px] text-red-400">{error}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={createMutation.isPending || !content.trim()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5",
            "font-amharic text-[13px] font-medium",
            "bg-gold-500 text-stone-950 transition-colors hover:bg-gold-400",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <Send className="h-3.5 w-3.5" />
          {createMutation.isPending ? "በመላክ ላይ..." : "ላክ"}
        </button>
      </div>
    </form>
  );
}
