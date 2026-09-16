import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Compass, Hash } from "lucide-react";
import {
  useTopic,
  useTopicVerses,
  useTag,
  useTagVerses,
} from "@/api/queries/discovery";
import { DiscoveryVerseCard } from "@/components/discovery/DiscoveryVerseCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { toEthiopicNumeral } from "@/lib/ethiopic";

export function DiscoveryDetailPage() {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const isTags = location.pathname.startsWith("/tags");

  return isTags ? <TagDetail slug={slug} /> : <TopicDetail slug={slug} />;
}

// ------------------------------------------------------------
// Topic detail
// ------------------------------------------------------------

function TopicDetail({ slug }: { slug?: string }) {
  const [page, setPage] = useState(1);
  const topicQuery = useTopic(slug);
  const versesQuery = useTopicVerses(slug, { page });

  return (
    <DiscoveryDetailShell
      backTo="/topics"
      backLabel="ወደ ርዕሶች"
      icon={<Compass className="h-4 w-4" />}
      isLoading={topicQuery.isLoading}
      isError={topicQuery.isError || !topicQuery.data}
      notFoundLabel="ርዕሱ አልተገኘም"
      title={topicQuery.data?.name_am}
      subtitle={topicQuery.data?.name_en ?? null}
      description={topicQuery.data?.description_am ?? null}
      verses={versesQuery.data?.data ?? []}
      versesMeta={versesQuery.data?.meta}
      versesLoading={versesQuery.isLoading}
      onPageChange={setPage}
    />
  );
}

// ------------------------------------------------------------
// Tag detail
// ------------------------------------------------------------

function TagDetail({ slug }: { slug?: string }) {
  const [page, setPage] = useState(1);
  const tagQuery = useTag(slug);
  const versesQuery = useTagVerses(slug, { page });

  return (
    <DiscoveryDetailShell
      backTo="/tags"
      backLabel="ወደ መለያዎች"
      icon={<Hash className="h-4 w-4" />}
      isLoading={tagQuery.isLoading}
      isError={tagQuery.isError || !tagQuery.data}
      notFoundLabel="መለያው አልተገኘም"
      title={tagQuery.data?.name_am}
      subtitle={tagQuery.data?.name_en ?? null}
      description={null}
      verses={versesQuery.data?.data ?? []}
      versesMeta={versesQuery.data?.meta}
      versesLoading={versesQuery.isLoading}
      onPageChange={setPage}
    />
  );
}

// ------------------------------------------------------------
// Shared shell
// ------------------------------------------------------------

function DiscoveryDetailShell({
  backTo,
  backLabel,
  icon,
  isLoading,
  isError,
  notFoundLabel,
  title,
  subtitle,
  description,
  verses,
  versesMeta,
  versesLoading,
  onPageChange,
}: {
  backTo: string;
  backLabel: string;
  icon: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  notFoundLabel: string;
  title: string | undefined;
  subtitle: string | null;
  description: string | null;
  verses: import("@/api/queries/discovery").DiscoveryVerse[];
  versesMeta: import("@/api/queries/discovery").PageMeta | undefined;
  versesLoading: boolean;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:px-8 md:py-14">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="font-amharic">{backLabel}</span>
      </Link>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !title ? (
        <EmptyState
          icon={icon}
          titleAm={notFoundLabel}
          hintAm="በመረጃ ቋቱ ውስጥ አልተገኘም።"
        />
      ) : (
        <article className="mt-6">
          <header className="border-b border-surface-border pb-8">
            <div className="flex items-center gap-2 text-gold-500/80">
              {icon}
            </div>
            <h1 className="mt-3 font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-[15px] text-text-muted">{subtitle}</p>
            )}
            {description && (
              <p className="mt-4 font-amharic text-[15px] leading-[1.9] text-text-secondary max-w-prose whitespace-pre-line">
                {description}
              </p>
            )}
          </header>

          <section className="py-10">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
                ጥቅሶች
              </h2>
              {versesMeta && (
                <span className="text-[11px] tabular-nums text-text-faint">
                  {toEthiopicNumeral(versesMeta.total)}
                </span>
              )}
            </header>

            {versesLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : verses.length === 0 ? (
              <p className="font-amharic text-[14px] text-text-muted">
                እስካሁን ጥቅስ አልተያዘም።
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {verses.map((v) => (
                    <DiscoveryVerseCard key={v.verse_id} verse={v} />
                  ))}
                </div>

                {versesMeta && versesMeta.pages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      page={versesMeta.page}
                      totalPages={versesMeta.pages}
                      onPageChange={onPageChange}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </article>
      )}

      <div className="h-16" />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-40" />
      <div className="space-y-3 py-10">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
