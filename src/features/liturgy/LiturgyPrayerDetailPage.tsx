import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { usePrayer } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export function LiturgyPrayerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = usePrayer(slug);

  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:px-8 md:py-14">
      <Link
        to="/liturgy?tab=prayers"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="font-amharic">ወደ ጸሎቶች</span>
      </Link>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-32" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      ) : isError || !data ? (
        <EmptyState
          icon={<BookOpen />}
          titleAm="ጸሎቱ አልተገኘም"
          hintAm="የፈለጉት ጸሎት በመረጃ ቋቱ ውስጥ አልተገኘም።"
        />
      ) : (
        <article className="mt-8">
          <header className="border-b border-surface-border pb-6">
            <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
              {data.title_am}
            </h1>
            {data.title_en && (
              <p className="mt-1 text-[15px] text-text-muted">
                {data.title_en}
              </p>
            )}
            {data.source_am && (
              <p className="mt-3 font-amharic text-[14px] text-gold-500/80 italic">
                {data.source_am}
              </p>
            )}
          </header>

          <div className="mt-8 font-amharic text-verse-lg leading-[2.1] text-text-primary whitespace-pre-line">
            {data.body_am}
          </div>

          {data.body_transliteration && (
            <div className="mt-10 border-t border-surface-border pt-6">
              <p className="mb-2 font-amharic text-[11px] font-medium uppercase tracking-wider text-text-faint">
                Transliteration
              </p>
              <p className="text-[15px] leading-[1.9] text-text-muted whitespace-pre-line">
                {data.body_transliteration}
              </p>
            </div>
          )}

          {data.body_en && (
            <div className="mt-8 border-t border-surface-border pt-6">
              <p className="mb-2 font-amharic text-[11px] font-medium uppercase tracking-wider text-text-faint">
                English
              </p>
              <p className="text-[15px] leading-[1.9] text-text-secondary whitespace-pre-line">
                {data.body_en}
              </p>
            </div>
          )}
        </article>
      )}
    </div>
  );
}
