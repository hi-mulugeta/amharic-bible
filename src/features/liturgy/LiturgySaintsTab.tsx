import { useState } from "react";
import { Link } from "react-router-dom";
import { User as UserIcon, Sparkles } from "lucide-react";
import { useAllSaints } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ETHIOPIAN_MONTHS } from "@/lib/ethiopic-months";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function LiturgySaintsTab() {
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState<number | undefined>(undefined);

  const { data, isLoading, isFetching } = useAllSaints({
    page,
    perPage: 40,
    month,
  });

  const saints = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Month filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMonth(undefined);
            setPage(1);
          }}
          className={cn(
            "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
            !month
              ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
              : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
          )}
        >
          ሁሉም
        </button>
        {ETHIOPIAN_MONTHS.map((name, i) => {
          const m = i + 1;
          const active = month === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMonth(m);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
                active
                  ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                  : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
              )}
            >
              {name}
            </button>
          );
        })}
        {meta && (
          <span className="ml-2 text-[12px] tabular-nums text-text-faint">
            {meta.total} ቅዱሳን
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : saints.length === 0 ? (
        <EmptyState
          icon={<UserIcon />}
          titleAm="ቅዱስ አልተገኘም"
          hintAm={month ? "በዚህ ወር ምንም ቅዱስ የለም።" : "እስካሁን ቅዱስ አልተመዘገበም።"}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 transition-opacity",
              isFetching ? "opacity-60" : "opacity-100",
            )}
          >
            {saints.map((s) => (
              <SaintCard key={s.id} saint={s} />
            ))}
          </div>
          {meta && meta.pages > 1 && (
            <div className="pt-4">
              <Pagination
                page={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SaintCard({
  saint,
}: {
  saint: import("@/api/queries/liturgy").SaintOut;
}) {
  return (
    <Link
      to={`/saints/${saint.slug}`}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-surface-border bg-surface-raised/20 p-4",
        "transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500/80 ring-1 ring-gold-500/20">
        <UserIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="font-amharic text-[15px] font-semibold text-text-primary group-hover:text-gold-400 transition-colors truncate">
            {saint.name_am}
          </p>
          {saint.is_feast && (
            <span className="inline-flex items-center gap-0.5 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold-400">
              <Sparkles className="h-2.5 w-2.5" />
              በዓል
            </span>
          )}
        </div>
        {saint.title_am && (
          <p className="mt-0.5 font-amharic text-[12px] text-text-muted truncate">
            {saint.title_am}
          </p>
        )}
        <p className="mt-2 font-amharic text-[11px] text-text-faint">
          {ETHIOPIAN_MONTHS[saint.ethiopian_month - 1]}{" "}
          {toEthiopicNumeral(saint.ethiopian_day)}
        </p>
      </div>
    </Link>
  );
}
