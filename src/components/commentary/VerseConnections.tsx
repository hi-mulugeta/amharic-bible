import { Link } from "react-router-dom";
import { GitBranch, Link2, Compass, ChevronRight } from "lucide-react";
import {
  useParallelVerses,
  useRelatedVerses,
  useVerseTopics,
  type CrossReferenceOut,
} from "@/api/queries/discovery";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

type Props = {
  bookSlug: string | null | undefined;
  chapter: number | null | undefined;
  verseNumber: number | null | undefined;
};

export function VerseConnections({ bookSlug, chapter, verseNumber }: Props) {
  const parallel = useParallelVerses(bookSlug, chapter, verseNumber);
  const related = useRelatedVerses(bookSlug, chapter, verseNumber);
  const topics = useVerseTopics(bookSlug, chapter, verseNumber);

  const hasParallel = (parallel.data?.length ?? 0) > 0;
  const hasRelated = (related.data?.length ?? 0) > 0;
  const hasTopics = (topics.data?.length ?? 0) > 0;
  const loading = parallel.isLoading || related.isLoading || topics.isLoading;
  const nothingToShow = !hasParallel && !hasRelated && !hasTopics;

  if (!loading && nothingToShow) return null;
  if (!bookSlug || chapter === null || verseNumber === null) return null;

  return (
    <footer className="space-y-5 border-t border-surface-border px-5 py-5">
      {parallel.isLoading ? (
        <ConnectionSkeleton />
      ) : hasParallel ? (
        <ConnectionGroup
          icon={<GitBranch className="h-3 w-3" />}
          label="ትይዩ ጥቅሶች"
          items={parallel.data ?? []}
        />
      ) : null}

      {related.isLoading ? (
        <ConnectionSkeleton />
      ) : hasRelated ? (
        <ConnectionGroup
          icon={<Link2 className="h-3 w-3" />}
          label="ተዛማጅ ጥቅሶች"
          items={related.data ?? []}
        />
      ) : null}

      {topics.isLoading ? (
        <ConnectionSkeleton />
      ) : hasTopics ? (
        <section>
          <header className="mb-2 flex items-center gap-2 text-text-faint">
            <Compass className="h-3 w-3" />
            <span className="font-amharic text-[11px] font-medium uppercase tracking-wider">
              ርዕሶች
            </span>
          </header>
          <ul className="flex flex-wrap gap-1.5">
            {topics.data!.map((topic) => (
              <li key={topic.id}>
                <Link
                  to={`/topics/${topic.slug}`}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
                    "bg-gold-500/10 text-gold-500",
                    "font-amharic text-[12px]",
                    "transition-colors hover:bg-gold-500/20",
                  )}
                >
                  {topic.name_am}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </footer>
  );
}

function ConnectionGroup({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  items: CrossReferenceOut[];
}) {
  return (
    <section>
      <header className="mb-2 flex items-center gap-2 text-text-faint">
        {icon}
        <span className="font-amharic text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-text-faint/70">
          {items.length}
        </span>
      </header>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <ReferenceRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function ReferenceRow({ item }: { item: CrossReferenceOut }) {
  if (!item.book_slug || item.chapter === null || item.verse_number === null) {
    return null;
  }

  const ref = `${item.book_name_am ?? item.book_slug} ${toEthiopicNumeral(
    item.chapter,
  )}:${toEthiopicNumeral(item.verse_number)}`;

  const preview = item.text_am
    ? item.text_am.length > 90
      ? item.text_am.slice(0, 90).trim() + "…"
      : item.text_am
    : null;

  return (
    <li>
      <Link
        to={`/bible/${item.book_slug}/${item.chapter}?verse=${item.verse_number}`}
        className={cn(
          "group/ref -mx-2 flex items-start gap-2 rounded-md px-2 py-1.5",
          "transition-colors hover:bg-surface-raised/50",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="font-amharic text-[12px] font-medium text-gold-500">
            {ref}
          </p>
          {preview && (
            <p className="mt-0.5 line-clamp-2 font-amharic text-[13px] leading-[1.7] text-text-muted">
              {preview}
            </p>
          )}
        </div>
        <ChevronRight
          className={cn(
            "mt-1 h-3 w-3 shrink-0 text-text-faint",
            "transition-transform group-hover/ref:translate-x-0.5",
          )}
        />
      </Link>
    </li>
  );
}

function ConnectionSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-24 animate-pulse rounded bg-surface-raised/60" />
      <div className="h-8 w-full animate-pulse rounded bg-surface-raised/40" />
      <div className="h-8 w-5/6 animate-pulse rounded bg-surface-raised/40" />
    </div>
  );
}
