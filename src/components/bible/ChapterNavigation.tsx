import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NavigationOut } from "@/api/queries/bible";
import { useBooks } from "@/api/queries/bible";

type Props = {
  nav: NavigationOut | undefined;
};

export function ChapterNavigation({ nav }: Props) {
  const { data: books } = useBooks();

  const label = (slug: string, chapter: number) => {
    const book = books?.find((b) => b.slug === slug);
    const name = book?.name_am ?? slug;
    return `${name} ${chapter}`;
  };

  return (
    <nav className="mt-16 flex items-center justify-between gap-4 border-t border-surface-border pt-8">
      {nav?.previous ? (
        <Link
          to={`/bible/${nav.previous.book_slug}/${nav.previous.chapter}`}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-amharic">
            {label(nav.previous.book_slug, nav.previous.chapter)}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {nav?.next ? (
        <Link
          to={`/bible/${nav.next.book_slug}/${nav.next.chapter}`}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
        >
          <span className="font-amharic">
            {label(nav.next.book_slug, nav.next.chapter)}
          </span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
