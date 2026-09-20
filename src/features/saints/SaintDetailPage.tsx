import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User as UserIcon,
  Sparkles,
  Calendar,
  Users as UsersIcon,
} from "lucide-react";
import { useSaint, useSaintsForDate } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ETHIOPIAN_MONTHS } from "@/lib/ethiopic-months";
import { toEthiopicNumeral } from "@/lib/ethiopic";

export function SaintDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useSaint(slug);

  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:max-w-shell md:px-12 md:py-17 lg:px-20">
      <Link
        to="/liturgy?tab=saints"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="font-amharic">ወደ ቅዱሳን</span>
      </Link>

      {isLoading ? (
        <SkeletonSection />
      ) : isError || !data ? (
        <EmptyState
          icon={<UserIcon />}
          titleAm="ቅዱሱ አልተገኘም"
          titleEn="Saint not found"
          hintAm="የፈለጉት ቅዱስ በመረጃ ቋቱ ውስጥ አልተገኘም።"
        />
      ) : (
        <article className="mt-8">
          {/* Header */}
          <header className="border-b border-surface-border pb-8">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500/80 ring-1 ring-gold-500/25">
                <UserIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
                    {data.name_am}
                  </h1>
                  {data.is_feast && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                      <Sparkles className="h-3 w-3" />
                      በዓል
                    </span>
                  )}
                </div>
                {data.name_en && (
                  <p className="mt-1 text-sm text-text-muted">{data.name_en}</p>
                )}
                {data.title_am && (
                  <p className="mt-2 font-amharic text-[15px] text-gold-500/90">
                    {data.title_am}
                  </p>
                )}
              </div>
            </div>

            {/* Commemoration date */}
            <div className="mt-6 flex items-center gap-2 font-amharic text-[13px] text-text-faint">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                የሚታወስበት ቀን: {ETHIOPIAN_MONTHS[data.ethiopian_month - 1]}{" "}
                {toEthiopicNumeral(data.ethiopian_day)}
              </span>
            </div>
          </header>

          {/* Bio */}
          {(data.long_bio_am || data.short_bio_am) && (
            <section className="py-8">
              <h2 className="mb-4 font-amharic text-[15px] font-semibold text-text-primary">
                የሕይወት ታሪክ
              </h2>
              <div className="font-amharic text-verse-md leading-[2] text-text-secondary whitespace-pre-line">
                {data.long_bio_am ?? data.short_bio_am}
              </div>
            </section>
          )}

          {/* Other saints on the same day */}
          <OtherSaintsOnSameDay
            month={data.ethiopian_month}
            day={data.ethiopian_day}
            excludeSlug={data.slug}
          />
        </article>
      )}
    </div>
  );
}

function OtherSaintsOnSameDay({
  month,
  day,
  excludeSlug,
}: {
  month: number;
  day: number;
  excludeSlug: string;
}) {
  // We don't have a direct month/day query, but we can hit today's date
  // via the /saints/{date} endpoint with a synthesized Gregorian equivalent.
  // Simpler: skip this for now and just link to the saints index.
  return (
    <section className="border-t border-surface-border pt-8">
      <div className="flex items-center gap-2 mb-3">
        <UsersIcon className="h-4 w-4 text-gold-500/80" />
        <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
          ተጨማሪ ቅዱሳን
        </h2>
      </div>
      <p className="font-amharic text-[13px] text-text-muted mb-4">
        {ETHIOPIAN_MONTHS[month - 1]} {toEthiopicNumeral(day)} የሚታወሱ ቅዱሳንን ሁሉ
        ለማየት፦
      </p>
      <Link
        to="/liturgy?tab=saints"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-gold-500 transition-colors hover:text-gold-400"
      >
        <span className="font-amharic">ወደ ቅዱሳን ዝርዝር</span>
        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
      </Link>
    </section>
  );
}

function SkeletonSection() {
  return (
    <div className="mt-8">
      <div className="flex items-start gap-5 border-b border-surface-border pb-8">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-3 py-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
