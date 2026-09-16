import { MessageCircle } from "lucide-react";
import type { ReadingVerse } from "@/api/queries/liturgy";
import { cn } from "@/lib/utils";

type Props = {
  verse: ReadingVerse;
  isSelected: boolean;
  onSelect: (verse: ReadingVerse) => void;
};

export function ReadingVerseItem({ verse, isSelected, onSelect }: Props) {
  const commentaryCount = verse.commentary_count ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(verse)}
      aria-pressed={isSelected}
      data-verse-id={verse.id}
      className={cn(
        "group relative block w-full text-left",
        "rounded-md px-2 py-1.5 -mx-2",
        "transition-colors duration-150",
        isSelected ? "bg-gold-500/[0.07]" : "hover:bg-stone-900/60",
      )}
    >
      <div className="flex gap-3">
        {/* Verse number column */}
        <span
          className={cn(
            "mt-[6px] min-w-[1.5rem] text-right text-xs tabular-nums font-medium select-none transition-colors",
            isSelected
              ? "text-gold-500"
              : "text-text-faint group-hover:text-text-muted",
          )}
        >
          {verse.verse_number_ethiopic ?? verse.verse_number}
        </span>

        {/* Text + badge */}
        <div className="flex-1">
          <p className="font-amharic text-[15px] leading-[1.9] text-text-secondary">
            {verse.text_am}
          </p>

          {/* Commentary badge — matches the reader */}
          {commentaryCount > 0 && (
            <span
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
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
}
