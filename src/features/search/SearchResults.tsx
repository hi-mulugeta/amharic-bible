import { Link } from "react-router-dom";
import { MessageCircle, BookOpen, AlertCircle } from "lucide-react";
import type {
  UnifiedSearchResponse,
  SearchVerse,
  SearchCommentary,
} from "@/api/queries/search";
import { renderMarked } from "@/lib/mark";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toEthiopicNumeral } from "@/lib/ethiopic";

type Props = {
  data: UnifiedSearchResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  scope: "all" | "verses" | "commentaries";
  totalResults: number;
};

export function SearchResults({
  data,
  isLoading,
  isError,
  scope,
  totalResults,
}: Props) {
  if (isLoading) return <ResultsSkeleton />;
  if (isError) return <ErrorState />;
  if (!data || totalResults === 0) return <NoResults />;

  const { verses, commentaries } = data.results;

  return (
    <div className="space-y-8">
      {/* Verses */}
      {scope !== "commentaries" && verses.length > 0 && (
        <section>
          <SectionHeader
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label="ጥቅሶች"
            count={verses.length}
          />
          <div className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border">
            {verses.map((v) => (
              <VerseResult key={v.id} verse={v} />
            ))}
          </div>
        </section>
      )}

      {/* Commentaries */}
      {scope !== "verses" && commentaries.length > 0 && (
        <section>
          <SectionHeader
            icon={<MessageCircle className="h-3.5 w-3.5" />}
            label="ትርጓሜዎች"
            count={commentaries.length}
          />
          <div className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border">
            {commentaries.map((c) => (
              <CommentaryResult key={c.id} commentary={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <header className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-gold-500/80">
        {icon}
        <h2 className="font-amharic text-[14px] font-semibold text-text-primary">
          {label}
        </h2>
      </div>
      <span className="text-[11px] tabular-nums text-text-faint">{count}</span>
    </header>
  );
}

function VerseResult({ verse }: { verse: SearchVerse }) {
  const ref = verse.book_name_am
    ? `${verse.book_name_am} ${toEthiopicNumeral(verse.chapter)}:${verse.verse_number_ethiopic ?? verse.verse_number}`
    : `${verse.chapter}:${verse.verse_number}`;

  return (
    <Link
      to={`/bible/${verse.book_slug ?? verse.book_id}/${verse.chapter}?verse=${verse.verse_number}`}
      className="block px-4 py-4 transition-colors hover:bg-surface-raised/40"
    >
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gold-500/80">
        {ref}
      </p>
      <p className="font-amharic text-[16px] leading-[1.9] text-text-primary">
        {renderMarked(verse.text_am)}
      </p>
    </Link>
  );
}

function CommentaryResult({ commentary }: { commentary: SearchCommentary }) {
  const body = commentary.excerpt_am ?? commentary.content_am ?? "";

  return (
    <Link
      to={`/bible/verse/${commentary.verse_id}`}
      className="block px-4 py-4 transition-colors hover:bg-surface-raised/40"
    >
      {commentary.author_name_am && (
        <p className="mb-1.5 font-amharic text-[12px] font-medium text-gold-500/80">
          {commentary.author_name_am}
        </p>
      )}
      <p className="font-amharic text-[15px] leading-[1.9] text-text-secondary">
        {renderMarked(body)}
      </p>
    </Link>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-8">
      <section>
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NoResults() {
  return (
    <EmptyState
      icon={<AlertCircle />}
      titleAm="ውጤት አልተገኘም"
      hintAm="ፍለጋዎን ያሳጥሩ ወይም ሌላ ቃል ይሞክሩ።"
      className="py-20"
    />
  );
}

function ErrorState() {
  return (
    <EmptyState
      icon={<AlertCircle />}
      titleAm="ስህተት ተፈጥሯል"
      hintAm="እባክዎ ቆይተው እንደገና ይሞክሩ።"
      className="py-20"
    />
  );
}
