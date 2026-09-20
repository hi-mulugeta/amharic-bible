import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  MessageSquare,
  Users as UsersIcon,
} from "lucide-react";
import {
  useAuthor,
  useAuthorWorks,
  useAuthorVerses,
} from "@/api/queries/authors";
import { AuthorAvatar } from "./AuthorCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { eraLabel } from "@/lib/era";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function AuthorDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const authorQuery = useAuthor(slug);
  const worksQuery = useAuthorWorks(slug);
  const [versesPage, setVersesPage] = useState(1);
  const versesQuery = useAuthorVerses(slug, { page: versesPage });

  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:max-w-shell md:px-12 md:py-17 lg:px-20">
      <Link
        to="/authors"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="font-amharic">ወደ ደራሲያን</span>
      </Link>

      {authorQuery.isLoading ? (
        <AuthorDetailSkeleton />
      ) : authorQuery.isError || !authorQuery.data ? (
        <EmptyState
          icon={<UsersIcon />}
          titleAm="ደራሲው አልተገኘም"
          titleEn="Author not found"
          hintAm="የፈለጉት ደራሲ በመረጃ ቋቱ ውስጥ አልተገኘም።"
        />
      ) : (
        <AuthorDetail
          author={authorQuery.data}
          works={worksQuery.data ?? []}
          worksLoading={worksQuery.isLoading}
          verses={versesQuery.data?.data ?? []}
          versesMeta={versesQuery.data?.meta}
          versesLoading={versesQuery.isLoading}
          versesPage={versesPage}
          onVersesPageChange={setVersesPage}
        />
      )}
    </div>
  );
}

function AuthorDetail({
  author,
  works,
  worksLoading,
  verses,
  versesMeta,
  versesLoading,
  versesPage,
  onVersesPageChange,
}: {
  author: NonNullable<ReturnType<typeof useAuthor>["data"]>;
  works: NonNullable<ReturnType<typeof useAuthorWorks>["data"]>;
  worksLoading: boolean;
  verses: NonNullable<ReturnType<typeof useAuthorVerses>["data"]>["data"];
  versesMeta:
    | NonNullable<ReturnType<typeof useAuthorVerses>["data"]>["meta"]
    | undefined;
  versesLoading: boolean;
  versesPage: number;
  onVersesPageChange: (p: number) => void;
}) {
  const era = eraLabel(author.era);
  const lifespan = formatLifespan(author.birth_year, author.death_year);

  return (
    <article className="mt-6">
      {/* ---------- Header ---------- */}
      <header className="border-b border-surface-border pb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <AuthorAvatar author={author} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
                {author.name_am}
              </h1>
              {author.ethiopian_venerated && (
                <span className="inline-flex items-center gap-1 rounded-sm bg-gold-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                  <Sparkles className="h-3 w-3" />
                  በኢትዮጵያ የተከበረ
                </span>
              )}
            </div>

            {author.name_en && (
              <p className="mt-1 text-[15px] text-text-muted">
                {author.name_en}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-faint">
              {era && (
                <span className="font-amharic text-gold-500/80">{era}</span>
              )}
              {era && lifespan && <span>·</span>}
              {lifespan && <span>{lifespan}</span>}
            </div>
          </div>
        </div>

        {author.bio_am && (
          <div className="mt-6 font-amharic text-[15px] leading-[1.9] text-text-secondary whitespace-pre-line max-w-prose">
            {author.bio_am}
          </div>
        )}
      </header>

      {/* ---------- Works ---------- */}
      <section className="py-10">
        <SectionHeader
          icon={<BookOpen className="h-4 w-4" />}
          label="ሥራዎች"
          count={works.length}
        />

        {worksLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <p className="font-amharic text-[14px] text-text-muted">
            እስካሁን ሥራ አልተመዘገበም።
          </p>
        ) : (
          <ul className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border bg-surface-raised/20">
            {works.map((work) => (
              <li key={work.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-amharic text-[15px] text-text-primary">
                    {work.title_am}
                  </p>
                  {work.title_en && (
                    <p className="mt-0.5 text-[12px] text-text-muted truncate">
                      {work.title_en}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-gold-400">
                  {work.commentary_count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Verses commented on ---------- */}
      <section className="pt-2">
        <SectionHeader
          icon={<MessageSquare className="h-4 w-4" />}
          label="ያስተማረባቸው ጥቅሶች"
          count={versesMeta?.total ?? verses.length}
        />

        {versesLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : verses.length === 0 ? (
          <p className="font-amharic text-[14px] text-text-muted">
            እስካሁን ጥቅስ አልተመዘገበም።
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {verses.map((v) => (
                <VerseMiniCard key={v.verse_id} verse={v} />
              ))}
            </div>

            {versesMeta && versesMeta.pages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={versesMeta.page}
                  totalPages={versesMeta.pages}
                  onPageChange={onVersesPageChange}
                />
              </div>
            )}
          </>
        )}
      </section>
    </article>
  );
}

function SectionHeader({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-gold-500/80">
        {icon}
        <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
          {label}
        </h2>
      </div>
      {count !== undefined && (
        <span className="text-[11px] tabular-nums text-text-faint">
          {toEthiopicNumeral(count)}
        </span>
      )}
    </header>
  );
}

function VerseMiniCard({
  verse,
}: {
  verse: NonNullable<
    ReturnType<typeof useAuthorVerses>["data"]
  >["data"][number];
}) {
  const ref = `${verse.book_name_am} ${toEthiopicNumeral(verse.chapter)}:${toEthiopicNumeral(verse.verse_number)}`;

  // Trim long verses for the card preview
  const preview =
    verse.text_am.length > 140
      ? verse.text_am.slice(0, 140).trim() + "…"
      : verse.text_am;

  return (
    <Link
      to={`/bible/${verse.book_slug}/${verse.chapter}?verse=${verse.verse_number}`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised/20 p-4",
        "transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40",
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wider text-gold-500/80">
        {ref}
      </span>
      <p className="font-amharic text-[14px] leading-[1.85] text-text-secondary">
        {preview}
      </p>
    </Link>
  );
}

function AuthorDetailSkeleton() {
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-5 border-b border-surface-border pb-8 sm:flex-row sm:items-start">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="space-y-3 py-10">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

function formatLifespan(
  birth: number | null,
  death: number | null,
): string | null {
  if (!birth && !death) return null;
  if (birth && death) return `${birth}–${death}`;
  if (birth) return `b. ${birth}`;
  return `d. ${death}`;
}
