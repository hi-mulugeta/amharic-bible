import { Book, User, Hash, Compass } from "lucide-react";
import type { SuggestItem } from "@/api/queries/search";
import { cn } from "@/lib/utils";

type Props = {
  suggestions: SuggestItem[];
  onPick: (slug: string, type: string) => void;
};

const ICONS = {
  book: Book,
  author: User,
  topic: Compass,
  tag: Hash,
} as const;

const LABELS = {
  book: "መጽሐፍ",
  author: "ደራሲ",
  topic: "ርዕስ",
  tag: "መለያ",
} as const;

export function SuggestionList({ suggestions, onPick }: Props) {
  return (
    <ul
      role="listbox"
      className={cn(
        "absolute left-0 right-0 top-full z-30 mt-2",
        "overflow-hidden rounded-xl border border-surface-border bg-stone-950 shadow-2xl",
        "animate-fade-in",
      )}
    >
      {suggestions.map((s, i) => {
        const Icon = ICONS[s.type] ?? Compass;
        return (
          <li key={`${s.type}-${s.id}-${i}`}>
            <button
              type="button"
              // Mousedown fires before blur, so the suggestion actually
              // wins over the input's blur handler.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(s.slug, s.type)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-raised"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-raised text-text-muted">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 truncate font-amharic text-[14px] text-text-primary">
                {s.label_am}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-text-faint">
                {LABELS[s.type] ?? s.type}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
