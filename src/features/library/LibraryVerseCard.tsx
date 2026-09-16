import { Link } from "react-router-dom";
import { ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
// import { toEthiopicNumeral } from "@/lib/ethiopic";
import { highlightTextColor } from "@/lib/highlightColors";
import { ConfirmButton } from "@/components/ui/ConfirmButton";

type Props = {
  bookSlug: string | null;
  bookNameAm: string | null;
  chapter: number | null;
  verseNumber: number | null;
  textAm: string | null;
  // Optional content displayed below the verse text
  contentAm?: string | null;
  contentLabel?: string;
  // Optional color for the verse text (used for highlights)
  textColor?: string | null;
  onDelete?: () => void;
  deleting?: boolean;
};

export function LibraryVerseCard({
  bookSlug,
  bookNameAm,
  chapter,
  verseNumber,
  textAm,
  contentAm,
  contentLabel,
  textColor,
  onDelete,
  deleting,
}: Props) {
  const hasRef =
    Boolean(bookSlug) &&
    typeof chapter === "number" &&
    typeof verseNumber === "number";

  const reference = hasRef
    ? `${bookNameAm ?? bookSlug} ${chapter}:${verseNumber}`
    : "—";

  const href = hasRef
    ? `/bible/${bookSlug}/${chapter}?verse=${verseNumber}`
    : "#";

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-surface-border bg-surface-raised/20",
        "transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40",
      )}
    >
      <Link to={href} className="block p-4" aria-disabled={!hasRef}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {/* Reference */}
            <p className="font-amharic text-[12px] font-medium text-gold-500/80">
              {reference}
            </p>

            {/* Verse text */}
            {textAm && (
              <p
                className={cn(
                  "mt-1.5 font-amharic text-[15px] leading-[1.9]",
                  textColor ? undefined : "text-text-primary",
                )}
                style={textColor ? { color: textColor } : undefined}
              >
                {textAm}
              </p>
            )}

            {/* Optional content below the verse (note text, highlight range, etc.) */}
            {contentAm && (
              <div className="mt-3 border-t border-surface-border/60 pt-3">
                {contentLabel && (
                  <p className="mb-1 font-amharic text-[11px] font-medium uppercase tracking-wider text-text-faint">
                    {contentLabel}
                  </p>
                )}
                <p className="font-amharic text-[14px] leading-[1.85] text-text-secondary whitespace-pre-line">
                  {contentAm}
                </p>
              </div>
            )}
          </div>

          <ChevronRight
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-text-faint",
              "transition-transform group-hover:translate-x-0.5 group-hover:text-gold-500",
            )}
          />
        </div>
      </Link>

      {onDelete && (
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <ConfirmButton onConfirm={onDelete} busy={deleting}>
            <Trash2 className="inline h-3 w-3 mr-1 align-[-1px]" />
            ሰርዝ
          </ConfirmButton>
        </div>
      )}
    </article>
  );
}
