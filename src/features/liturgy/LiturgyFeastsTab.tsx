import { useState } from "react";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import {
  useUpcomingFeasts,
  useFeastsCalendar,
  useFastingToday,
} from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ETHIOPIAN_MONTHS } from "@/lib/ethiopic-months";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function LiturgyFeastsTab() {
  const fasting = useFastingToday();
  const todayEthiopianYear = fasting.data?.ethiopian.year;
  const [calendarYear, setCalendarYear] = useState<number | undefined>(
    undefined,
  );
  const activeYear = calendarYear ?? todayEthiopianYear;

  const upcoming = useUpcomingFeasts(120);
  const calendar = useFeastsCalendar(activeYear);

  return (
    <div className="space-y-10">
      {/* Upcoming */}
      <section>
        <h2 className="mb-3 font-amharic text-[13px] font-semibold uppercase tracking-wider text-text-faint">
          የሚመጡ በዓላት
        </h2>
        {upcoming.isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : upcoming.data && upcoming.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.data.map((f) => (
              <FeastCard key={f.id} feast={f} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar />}
            titleAm="በዓል አልተገኘም"
            hintAm="በሚቀጥሉት ቀናት ውስጥ በዓል የለም።"
            className="py-12"
          />
        )}
      </section>

      {/* Year calendar */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-amharic text-[13px] font-semibold uppercase tracking-wider text-text-faint">
            የዓመቱ ካላንደር
          </h2>
          {activeYear && (
            <span className="font-amharic text-[12px] tabular-nums text-text-faint">
              {toEthiopicNumeral(activeYear)} ዓ.ም.
            </span>
          )}
        </div>

        {calendar.isLoading || !activeYear ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : calendar.data ? (
          <div className="space-y-1">
            {calendar.data.months.map((month) => (
              <MonthSection key={month.month} month={month} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function MonthSection({
  month,
}: {
  month: NonNullable<
    ReturnType<typeof useFeastsCalendar>["data"]
  >["months"][number];
}) {
  const [open, setOpen] = useState(month.feasts.length > 0);

  return (
    <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-raised/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised/30"
      >
        <div className="flex items-center gap-3">
          <span className="font-amharic text-[15px] text-text-primary">
            {month.month_name}
          </span>
          {month.feasts.length > 0 && (
            <span className="rounded-full bg-gold-500/10 px-2 py-0.5 font-amharic text-[11px] tabular-nums text-gold-400">
              {toEthiopicNumeral(month.feasts.length)}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && month.feasts.length > 0 && (
        <ul className="border-t border-surface-border divide-y divide-surface-border/60">
          {month.feasts.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px]"
            >
              <span className="w-10 text-right font-amharic text-[12px] tabular-nums text-gold-500/80">
                {toEthiopicNumeral(f.ethiopian_day)}
              </span>
              <span className="flex-1 font-amharic text-text-secondary">
                {f.name_am}
              </span>
              {f.breaks_fast && (
                <span className="rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                  በዓል
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeastCard({
  feast,
}: {
  feast: NonNullable<ReturnType<typeof useUpcomingFeasts>["data"]>[number];
}) {
  const monthName =
    feast.ethiopian_month_name ?? ETHIOPIAN_MONTHS[feast.ethiopian_month - 1];
  const ethiopianDate = `${monthName} ${toEthiopicNumeral(feast.ethiopian_day)}`;
  const countdown = feast.gregorian_date
    ? formatCountdown(feast.gregorian_date)
    : null;

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
          በዓል
        </span>
        {countdown && (
          <span className="font-amharic text-[11px] text-gold-500/90">
            {countdown}
          </span>
        )}
      </div>
      <h3 className="font-amharic text-[16px] font-semibold leading-snug text-text-primary">
        {feast.name_am}
      </h3>
      {feast.description_am && (
        <p className="font-amharic text-[12px] leading-[1.7] text-text-muted line-clamp-2">
          {feast.description_am}
        </p>
      )}
      <p className="mt-auto font-amharic text-[11px] text-text-faint">
        {ethiopianDate}
      </p>
    </article>
  );
}

function formatCountdown(iso: string): string | null {
  const target = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return null;
  if (days === 0) return "ዛሬ";
  if (days === 1) return "ነገ";
  return `በ ${toEthiopicNumeral(days)} ቀን`;
}
