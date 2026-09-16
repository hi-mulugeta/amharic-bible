import { MessageCircle } from "lucide-react";
import type { ReadingVerse } from "@/api/queries/liturgy";
import { cn } from "@/lib/utils";
import { useReaderStore } from "@/stores/readerStore";
import { FONT_SIZE_CLASS } from "@/lib/fontSize";

type Props = {
  verse: ReadingVerse;
  isSelected: boolean;
  onSelect: (verse: ReadingVerse) => void;
  highlightColor?: string | null;
};

export function ReadingVerseItem({
  verse,
  isSelected,
  onSelect,
  highlightColor,
}: Props) {
  const fontSize = useReaderStore((s) => s.fontSize);
  const commentaryCount = verse.commentary_count ?? 0;
  const sizeClass = FONT_SIZE_CLASS[fontSize];
  const isHighlighted = Boolean(highlightColor);

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

        <div className="flex-1 min-w-0">
          <p
            className={cn(sizeClass)}
            style={{
              fontFamily: `'Menbere', 'Nyala', 'Noto Serif Ethiopic', serif`,
              color: isHighlighted
                ? highlightTextColor(highlightTextColor)
                : "rgb(214 211 209)", // text-text-secondary
            }}
          >
            {verse.text_am}
          </p>

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
