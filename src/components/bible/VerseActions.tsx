import { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Highlighter,
  FileText,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import {
  useBookmarksForVerse,
  useToggleBookmark,
  useHighlightsForChapter,
  useCreateHighlight,
  useDeleteHighlight,
} from "@/api/queries/user";
import { cn } from "@/lib/utils";

type Props = {
  verseId: number;
  bookSlug: string | null;
  chapter: number | null;
  verseNumber: number | null;
  onOpenNote?: () => void;
  inline?: boolean;
};

const HIGHLIGHT_COLORS = [
  { key: "yellow", value: "gold", label: "ወርቃማ", dot: "bg-gold-500" },
  { key: "green", value: "green", label: "አረንጓዴ", dot: "bg-emerald-500" },
  { key: "blue", value: "blue", label: "ሰማያዊ", dot: "bg-sky-500" },
  { key: "pink", value: "pink", label: "ሮዝ", dot: "bg-pink-500" },
] as const;

export function VerseActions({
  verseId,
  bookSlug,
  chapter,
  verseNumber,
  onOpenNote,
  inline,
}: Props) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const bookmarks = useBookmarksForVerse(verseId, { enabled: isAuthenticated });
  const toggleBookmark = useToggleBookmark();

  const highlights = useHighlightsForChapter(bookSlug, chapter, {
    enabled: isAuthenticated,
  });
  const createHighlight = useCreateHighlight();
  const deleteHighlight = useDeleteHighlight();

  const activeBookmark = bookmarks.data?.[0];
  const isBookmarked = Boolean(activeBookmark);

  const activeHighlight = highlights.data?.find((h) => {
    if (verseNumber === null) return false;
    const vn = Number(verseNumber);
    return Number(h.start_verse) <= vn && Number(h.end_verse) >= vn;
  });
  const isHighlighted = Boolean(activeHighlight);

  const requireAuth = (): boolean => {
    if (isAuthenticated) return true;
    navigate(
      `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );
    return false;
  };

  const handleBookmark = () => {
    if (!requireAuth()) return;
    toggleBookmark.mutate({ verseId, existingId: activeBookmark?.id });
  };

  const handleHighlightClick = () => {
    if (!requireAuth()) return;
    if (!bookSlug || chapter === null || verseNumber === null) return;

    // Re-derive from the latest cached data, not the possibly-stale
    // `activeHighlight` computed at render time.
    const fresh = highlights.data?.find((h) => {
      const vn = Number(verseNumber);
      return Number(h.start_verse) <= vn && Number(h.end_verse) >= vn;
    });

    if (fresh) {
      deleteHighlight.mutate(fresh.id);
    } else {
      setColorPickerOpen((v) => !v);
    }
  };

  const handleColorPick = (color: string) => {
    if (!bookSlug || chapter === null || verseNumber === null) return;
    setColorPickerOpen(false);

    // The backend upserts. If a highlight exists at these coordinates,
    // its color is replaced. No delete needed.
    createHighlight.mutate({
      book_slug: bookSlug,
      chapter,
      start_verse: verseNumber,
      end_verse: verseNumber,
      color,
    });

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  };
  return (
    <div className="relative flex items-center gap-0.5">
      <ActionButton
        onClick={handleBookmark}
        active={isBookmarked}
        label={isBookmarked ? "ቅጥል አስወግድ" : "ቅጥል አድርግ"}
      >
        {isBookmarked ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </ActionButton>

      <ActionButton
        onClick={handleHighlightClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (isHighlighted) setColorPickerOpen((v) => !v);
        }}
        active={isHighlighted}
        label={isHighlighted ? "አድማሚውን አስወግድ" : "አድምቅ"}
      >
        {justSaved ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Highlighter className="h-3.5 w-3.5" />
        )}
      </ActionButton>

      <ActionButton onClick={onOpenNote} label="ማስታወሻ ጻፍ">
        <FileText className="h-3.5 w-3.5" />
      </ActionButton>

      {colorPickerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setColorPickerOpen(false)}
          />
          <div
            className={cn(
              "absolute z-50 mt-2 flex items-center gap-1 rounded-xl border border-surface-border bg-stone-950 p-1.5 shadow-xl animate-fade-in",
              inline ? "left-0 top-full" : "right-0 top-full",
            )}
          >
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => handleColorPick(c.value)}
                aria-label={c.label}
                className={cn(
                  "h-6 w-6 rounded-full border border-transparent transition-transform hover:scale-110",
                  c.dot,
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Icon button with a custom styled tooltip.
 * Native `title` attribute renders an OS tooltip — square, unthemed.
 * This is a small absolute-positioned element that matches the design.
 */
function ActionButton({
  children,
  onClick,
  onContextMenu,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  active?: boolean;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hide the tooltip if the mouse leaves
  useEffect(() => {
    if (!hovered) return;
    const t = setTimeout(() => setHovered(false), 4000);
    return () => clearTimeout(t);
  }, [hovered]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onContextMenu={onContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={label}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          active
            ? "text-gold-500 hover:bg-gold-500/10"
            : "text-text-faint hover:bg-surface-raised hover:text-text-primary",
        )}
      >
        {children}
      </button>

      {hovered && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 top-full z-40 mt-1.5 -translate-x-1/2",
            "whitespace-nowrap rounded-md border border-surface-border bg-stone-900 px-2 py-1",
            "font-amharic text-[11px] text-text-secondary shadow-lg",
            "animate-fade-in",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
