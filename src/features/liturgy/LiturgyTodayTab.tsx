import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, User as UserIcon } from "lucide-react";
import {
  useDailyReading,
  useVerseOfDay,
  useSaintsToday,
  useFastingToday,
} from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function LiturgyTodayTab() {
  const verseOfDay = useVerseOfDay();
  const dailyReading = useDailyReading();
  const saints = useSaintsToday();
  const fasting = useFastingToday();

  return (
    <div className="space-y-8">
      {/* Date + fasting banner */}
      {fasting.isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : fasting.data ? (
        <FastingBanner data={fasting.data} />
      ) : null}

      {/* Verse of the day */}
      <section>
        <SectionHeader label="የዕለቱ ጥቅስ" />
        {verseOfDay.isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : verseOfDay.data && verseOfDay.data.text_am ? (
          <VerseCard vod={verseOfDay.data} />
        ) : (
          <p className="font-amharic text-[14px] text-text-muted">
            የዕለቱ ጥቅስ አልተዘጋጀም።
          </p>
        )}
      </section>

      {/* Daily reading */}
      <section>
        <SectionHeader label="የዕለቱ ምንባብ" />
        {dailyReading.isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : dailyReading.data && dailyReading.data.readings.length > 0 ? (
          <div className="space-y-3">
            {dailyReading.data.readings.map((block, i) => (
              <ReadingBlockCard key={i} block={block} />
            ))}
          </div>
        ) : (
          <p className="font-amharic text-[14px] text-text-muted">
            የዕለቱ ምንባብ አልተዘጋጀም።
          </p>
        )}
      </section>

      {/* Saints */}
      <section>
        <SectionHeader label="የዕለቱ ቅዱሳን" count={saints.data?.length} />
        {saints.isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : saints.data && saints.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saints.data.map((s) => (
              <Link
                key={`${s.slug}-${s.ethiopian_day}`}
                to={`/saints/${s.slug}`}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border border-surface-border bg-surface-raised/20 p-4",
                  "transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40",
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500/80 ring-1 ring-gold-500/20">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-amharic text-[15px] font-semibold text-text-primary group-hover:text-gold-400 transition-colors truncate">
                    {s.name_am}
                  </p>
                  {s.title_am && (
                    <p className="mt-0.5 font-amharic text-[12px] text-text-muted truncate">
                      {s.title_am}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="font-amharic text-[14px] text-text-muted">
            ዛሬ ምንም የተዘከረ ቅዱስ የለም።
          </p>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <header className="mb-3 flex items-center justify-between">
      <h2 className="font-amharic text-[13px] font-semibold uppercase tracking-wider text-text-faint">
        {label}
      </h2>
      {count !== undefined && count > 0 && (
        <span className="text-[11px] tabular-nums text-text-faint">
          {count}
        </span>
      )}
    </header>
  );
}

function FastingBanner({
  data,
}: {
  data: NonNullable<ReturnType<typeof useFastingToday>["data"]>;
}) {
  const feast = data.feasts_today?.[0];
  const variant = feast ? "feast" : data.is_fasting ? "fasting" : "normal";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border p-5",
        variant === "feast" && "border-gold-500/30 bg-gold-500/[0.05]",
        variant === "fasting" && "border-amber-500/30 bg-amber-500/[0.04]",
        variant === "normal" && "border-surface-border bg-surface-raised/20",
      )}
    >
      <div>
        <p className="font-amharic text-[15px] font-semibold text-text-primary">
          {feast ? feast.name_am : data.is_fasting ? "ዛሬ ጾም ነው" : "ዛሬ ጾም አይደለም"}
        </p>
        <p className="mt-1 font-amharic text-[12px] text-text-muted">
          {data.ethiopian.display}
          {feast ? " · በዓል" : data.reason_am ? ` · ${data.reason_am}` : ""}
        </p>
      </div>
      <span
        className={cn(
          "h-3 w-3 rounded-full shrink-0",
          variant === "feast" && "bg-gold-500",
          variant === "fasting" && "bg-amber-500",
          variant === "normal" && "bg-emerald-500/60",
        )}
      />
    </div>
  );
}

function VerseCard({
  vod,
}: {
  vod: NonNullable<ReturnType<typeof useVerseOfDay>["data"]>;
}) {
  const reference =
    vod.book_name_am && vod.chapter && vod.verse_number
      ? `${vod.book_name_am} ${toEthiopicNumeral(vod.chapter)}:${vod.verse_number_ethiopic ?? vod.verse_number}`
      : null;

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised/20 p-5">
      <p className="font-amharic text-verse-md leading-[2.05] text-text-primary">
        {vod.text_am}
      </p>
      {reference && (
        <p className="mt-3 font-amharic text-[13px] text-gold-500/80">
          — {reference}
        </p>
      )}
      {vod.reflection_am && (
        <p className="mt-3 font-amharic text-[14px] leading-[1.9] text-text-secondary">
          {vod.reflection_am}
        </p>
      )}
      {vod.book_slug && vod.chapter && (
        <Link
          to={`/bible/${vod.book_slug}/${vod.chapter}${vod.verse_number ? `?verse=${vod.verse_number}` : ""}`}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-gold-500 transition-colors hover:text-gold-400"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="font-amharic">በአንባቢው ውስጥ ክፈት</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function ReadingBlockCard({
  block,
}: {
  block: NonNullable<
    ReturnType<typeof useDailyReading>["data"]
  >["readings"][number];
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised/20 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-sm bg-gold-500/15 px-1.5 py-0.5 font-amharic text-[10px] font-medium uppercase tracking-wider text-gold-400">
          {block.kind}
        </span>
        <span className="font-amharic text-[14px] text-text-primary">
          {block.book_name_am} {block.chapter_ethiopic}:{block.start_ethiopic}
          {block.start !== block.end ? `–${block.end_ethiopic}` : ""}
        </span>
      </div>
      <div className="space-y-2">
        {block.verses.map((v) => (
          <div key={v.id} className="flex gap-3">
            <span className="mt-[7px] min-w-[1.5rem] text-right text-xs tabular-nums text-text-faint">
              {v.verse_number_ethiopic}
            </span>
            <p className="flex-1 font-amharic text-[15px] leading-[1.9] text-text-secondary">
              {v.text_am}
            </p>
          </div>
        ))}
      </div>
      <Link
        to={`/bible/${block.book_slug}/${block.chapter}`}
        className="mt-3 inline-flex font-amharic text-[13px] font-medium text-gold-500 transition-colors hover:text-gold-400"
      >
        በአንባቢው ውስጥ ክፈት →
      </Link>
    </div>
  );
}
