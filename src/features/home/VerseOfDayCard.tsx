import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useVerseOfDay } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { toEthiopicNumeral } from "@/lib/ethiopic";

export function VerseOfDayCard() {
  const { data, isLoading } = useVerseOfDay();

  if (isLoading) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-raised/30 px-6 py-8 md:px-10 md:py-10">
        <Skeleton className="h-3 w-24 mb-6" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-5/6 mb-2" />
        <Skeleton className="h-6 w-4/6" />
        <Skeleton className="mt-6 h-3 w-32" />
      </section>
    );
  }

  // If there's no verse of the day, we show a gentle prompt
  if (!data || !data.text_am) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-surface-ring-border bg-surface-raised/30 px-6 py-10 md:px-10 md:py-14 text-center">
        <p className="font-amharic text-verse text-text-primary max-w-prose mx-auto">
          የዕለቱ ጥቅስ አልተዘጋጀም።
        </p>
        <p className="mt-3 font-amharic text-sm text-text-muted">
          ከየትኛውም ምዕራፍ ማንበብ ይጀምሩ።
        </p>
        <Link
          to="/bible/matthew/1"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 font-amharic text-[14px] font-medium text-stone-950 transition-colors hover:bg-gold-400"
        >
          ማንበብ ጀምር
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    );
  }

  const reference =
    data.book_name_am && data.chapter && data.verse_number
      ? `${data.book_name_am} ${toEthiopicNumeral(data.chapter)}:${data.verse_number_ethiopic ?? data.verse_number}`
      : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-raised/30">
      {/* Amber accent — left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold-500/60 via-gold-500/40 to-transparent" />

      <div className="px-6 py-8 md:px-10 md:py-12">
        <p className="text-[11px] uppercase tracking-[0.15em] text-gold-500/80 font-medium">
          የዕለቱ ጥቅስ
        </p>

        <blockquote className="mt-5">
          <p className="font-amharic text-verse-lg text-text-primary text-balance">
            {data.text_am}
          </p>
        </blockquote>

        {reference && (
          <p className="mt-5 font-amharic text-sm text-text-muted">
            — {reference}
          </p>
        )}

        {data.reflection_am && (
          <p className="mt-5 max-w-prose font-amharic text-[15px] leading-[1.9] text-text-secondary">
            {data.reflection_am}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {data.book_slug && data.chapter && (
            <Link
              to={`/bible/${data.book_slug}/${data.chapter}`}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-gold-500 transition-colors hover:text-gold-400"
            >
              <span className="font-amharic">ሙሉውን ምዕራፍ አንብብ</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          {data.commentary_id &&
            data.book_slug &&
            data.chapter &&
            data.verse_number && (
              <Link
                to={`/bible/${data.book_slug}/${data.chapter}?verse=${data.verse_number}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-secondary"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="font-amharic">ትርጓሜ</span>
              </Link>
            )}
        </div>
      </div>
    </section>
  );
}
