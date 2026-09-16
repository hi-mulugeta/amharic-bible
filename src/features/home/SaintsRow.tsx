import { Link } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import { useSaintsToday } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";

export function SaintsRow() {
  const { data, isLoading } = useSaintsToday();

  if (isLoading) {
    return (
      <section>
        <SectionHeader />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null; // hidden — no saints today isn't a failure

  return (
    <section>
      <SectionHeader count={data.length} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((saint) => (
          <Link
            key={`${saint.slug}-${saint.ethiopian_day}`}
            to={`/saints/${saint.slug}`}
            className="group flex items-start gap-3 rounded-xl border border-surface-border bg-surface-raised/20 p-4 transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500/80 ring-1 ring-gold-500/20">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-amharic text-[15px] font-semibold text-text-primary truncate group-hover:text-gold-400 transition-colors">
                {saint.name_am}
              </p>
              {saint.title_am && (
                <p className="mt-0.5 font-amharic text-[12px] text-text-muted truncate">
                  {saint.title_am}
                </p>
              )}
              {saint.short_bio_am && (
                <p className="mt-1.5 font-amharic text-[12px] leading-[1.7] text-text-faint line-clamp-2">
                  {saint.short_bio_am}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ count }: { count?: number }) {
  return (
    <header className="mb-3 flex items-center justify-between">
      <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
        የዕለቱ ቅዱሳን
      </h2>
      {count !== undefined && (
        <span className="text-[11px] tabular-nums text-text-faint">
          {count}
        </span>
      )}
    </header>
  );
}
