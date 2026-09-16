import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toEthiopicNumeral } from "@/lib/ethiopic";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav aria-label="ገጽ ማሰስ" className="flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(page - 1)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
          canPrev
            ? "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            : "cursor-not-allowed text-text-faint opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="font-amharic">ቀዳሚ</span>
      </button>

      <span className="font-amharic text-[13px] text-text-muted tabular-nums">
        {toEthiopicNumeral(page)} / {toEthiopicNumeral(totalPages)}
      </span>

      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(page + 1)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
          canNext
            ? "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            : "cursor-not-allowed text-text-faint opacity-40",
        )}
      >
        <span className="font-amharic">ቀጣይ</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
