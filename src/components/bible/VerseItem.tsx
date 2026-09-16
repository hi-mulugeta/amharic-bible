import { forwardRef } from "react";
import { MessageCircle } from "lucide-react";
import type { VerseOut } from "@/api/queries/bible";
import { cn } from "@/lib/utils";

type Props = {
  verse: VerseOut;
  isSelected: boolean;
  onSelect: (verse: VerseOut) => void;
};

export const VerseItem = forwardRef<HTMLButtonElement, Props>(
  ({ verse, isSelected, onSelect }, ref) => {
    const commentaryCount = verse.commentary_count ?? 0;

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onSelect(verse)}
        aria-pressed={isSelected}
        data-verse-id={verse.id}
        className={cn(
          "group relative block w-full cursor-pointer text-left",
          "rounded-md px-2 py-2 -mx-2",
          "transition-colors duration-150",
          isSelected ? "bg-gold-500/[0.07]" : "hover:bg-stone-900/60",
        )}
      >
        {/* Selection indicator — subtle amber bar */}
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity duration-200",
            isSelected ? "bg-gold-500 opacity-100" : "opacity-0",
          )}
        />

        <div className="flex gap-3">
          {/* Verse number column */}
          <span
            className={cn(
              "mt-[7px] min-w-[1.75rem] text-right text-xs tabular-nums font-medium select-none transition-colors",
              isSelected
                ? "text-gold-500"
                : "text-text-faint group-hover:text-text-muted",
            )}
          >
            {verse.verse_number_ethiopic ?? verse.verse_number}
          </span>

          {/* Text */}
          <div className="flex-1">
            <p className="font-amharic text-verse text-text-primary text-balance">
              {verse.text_am}
            </p>

            {/* Commentary badge */}
            {commentaryCount > 0 && (
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                  "text-[11px] font-medium tabular-nums transition-colors",
                  isSelected
                    ? "bg-gold-500/20 text-gold-300"
                    : "bg-surface-raised text-text-muted group-hover:text-text-secondary",
                )}
              >
                <MessageCircle className="h-3 w-3" strokeWidth={2.25} />
                {commentaryCount}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  },
);

VerseItem.displayName = "VerseItem";
