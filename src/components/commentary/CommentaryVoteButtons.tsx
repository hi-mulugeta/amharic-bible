import { ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import {
  useVoteTally,
  useCastVote,
  useRemoveVote,
} from "@/api/queries/community";
import { cn } from "@/lib/utils";

export function CommentaryVoteButtons({
  commentaryId,
}: {
  commentaryId: number;
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: tally, isLoading } = useVoteTally(commentaryId);
  const castVote = useCastVote();
  const removeVote = useRemoveVote();

  const myVote = tally?.my_vote ?? null;
  const score = tally?.score ?? 0;

  const requireAuth = (): boolean => {
    if (isAuthenticated) return true;
    navigate(
      `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );
    return false;
  };

  const handleUp = () => {
    if (!requireAuth()) return;
    if (myVote === 1) {
      removeVote.mutate(commentaryId);
    } else {
      castVote.mutate({ commentaryId, vote: 1 });
    }
  };

  const handleDown = () => {
    if (!requireAuth()) return;
    if (myVote === -1) {
      removeVote.mutate(commentaryId);
    } else {
      castVote.mutate({ commentaryId, vote: -1 });
    }
  };

  const busy = castVote.isPending || removeVote.isPending;

  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={handleUp}
        disabled={busy}
        aria-label="ወደ ላይ ድምጽ"
        aria-pressed={myVote === 1}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
          myVote === 1
            ? "bg-gold-500/20 text-gold-500"
            : "text-text-faint hover:bg-surface-raised hover:text-text-primary",
          busy && "opacity-50",
        )}
      >
        <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <span
        className={cn(
          "text-[12px] font-semibold tabular-nums",
          isLoading
            ? "text-text-faint"
            : myVote === 1
              ? "text-gold-500"
              : myVote === -1
                ? "text-red-500"
                : "text-text-muted",
        )}
      >
        {score}
      </span>

      <button
        type="button"
        onClick={handleDown}
        disabled={busy}
        aria-label="ወደ ታች ድምጽ"
        aria-pressed={myVote === -1}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
          myVote === -1
            ? "bg-red-500/20 text-red-500"
            : "text-text-faint hover:bg-surface-raised hover:text-text-primary",
          busy && "opacity-50",
        )}
      >
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
