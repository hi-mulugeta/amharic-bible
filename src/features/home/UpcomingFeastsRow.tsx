import { Calendar } from "lucide-react";
import { useUpcomingFeasts, type FeastDayOut } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { ETHIOPIAN_MONTHS } from "@/lib/ethiopic-months";

export function UpcomingFeastsRow() {
  const { data, isLoading } = useUpcomingFeasts(90);

  if (isLoading) {
    return (
      <section>
        <SectionHeader />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null; // hidden — no upcoming feasts isn't a failure

  return (
    <section>
      <SectionHeader count={data.length} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((feast) => (
          <FeastCard key={feast.id} feast={feast} />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ count }: { count?: number }) {
  return (
    <header className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gold-500/70" />
        <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
          የሚመጡ በዓላት
        </h2>
      </div>
      {count !== undefined && (
        <span className="text-[11px] tabular-nums text-text-faint">
          {count}
        </span>
      )}
    </header>
  );
}

function FeastCard({ feast }: { feast: FeastDayOut }) {
  const monthName =
    feast.ethiopian_month_name ?? ETHIOPIAN_MONTHS[feast.ethiopian_month - 1];
  const ethiopianDate = `${monthName} ${toEthiopicNumeral(feast.ethiopian_day)}`;
  const countdown = feast.gregorian_date
    ? formatCountdown(feast.gregorian_date)
    : null;

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised/20 p-4 transition-colors hover:border-gold-500/30">
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

/**
 * "በ 5 ቀናት" / "በ 1 ቀን" / "በ 30 ቀናት"
 * A tiny helper so the wording matches Amharic convention.
 */
function formatCountdown(gregorianDateISO: string): string | null {
  const target = new Date(gregorianDateISO + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return null;
  if (days === 0) return "ዛሬ";
  if (days === 1) return "ነገ";
  return `በ ${toEthiopicNumeral(days)} ቀናት`;
}
