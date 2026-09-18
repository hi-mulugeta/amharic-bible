import { forwardRef } from "react";
import { MessageCircle, FileText } from "lucide-react";
import type { VerseOut } from "@/api/queries/bible";
import { cn } from "@/lib/utils";
import { useReaderStore } from "@/stores/readerStore";
import { FONT_SIZE_CLASS } from "@/lib/fontSize";
import { highlightTextColor } from "@/lib/highlightColors";
import { fontFamilyStack } from "@/lib/fontFamily";

type Props = {
  verse: VerseOut;
  isSelected: boolean;
  onSelect: (verse: VerseOut) => void;
  highlightColor?: string | null;
  hasNote?: boolean;
};

export const VerseItem = forwardRef<HTMLButtonElement, Props>(
  ({ verse, isSelected, onSelect, highlightColor, hasNote }, ref) => {
    const fontSize = useReaderStore((s) => s.fontSize);
    const fontFamily = useReaderStore((s) => s.fontFamily);
    const commentaryCount = verse.commentary_count ?? 0;
    const sizeClass = FONT_SIZE_CLASS[fontSize];
    const textColor = highlightTextColor(highlightColor);
    const isHighlighted = Boolean(highlightColor);

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
          isSelected ? "bg-gold-500/[0.07]" : "hover:bg-surface-raised/40",
        )}
      >
        {/* Selection indicator */}
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity duration-200",
            isSelected ? "bg-gold-500 opacity-100" : "opacity-0",
          )}
        />

        <div className="flex gap-3">
          {/* Verse number */}
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

          {/* Text + badges */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-amharic text-[15px] leading-[1.9] text-text-primary text-justify hyphens-auto",
                sizeClass,
              )}
              style={{
                fontFamily: fontFamilyStack(fontFamily),
                color: isHighlighted
                  ? textColor
                  : "rgb(var(--color-text-primary))",
              }}
            >
              {verse.text_am}
            </p>

            {/* Badges */}
            {(commentaryCount > 0 || hasNote) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {commentaryCount > 0 && (
                  <span
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                      "text-[11px] font-medium tabular-nums transition-colors",
                      isSelected
                        ? "bg-gold-500/20 text-gold-300"
                        : "bg-surface-raised text-text-secondary group-hover:text-text-primary",
                    )}
                  >
                    <MessageCircle className="h-3 w-3" strokeWidth={2.25} />
                    {commentaryCount}
                  </span>
                )}

                {hasNote && (
                  <span
                    className={cn(
                      "ml-1.5 mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                      "text-[11px] font-medium transition-colors",
                      isSelected
                        ? "bg-gold-500/25 text-gold-400"
                        : "bg-gold-500/15 text-gold-500",
                    )}
                    title="ማስታወሻ አለ"
                  >
                    <FileText className="h-3 w-3" strokeWidth={2.25} />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  },
);

VerseItem.displayName = "VerseItem";
