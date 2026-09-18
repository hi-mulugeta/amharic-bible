import { Leaf } from "lucide-react";
import { useFastingToday } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function LiturgyFastingTab() {
  const { data, isLoading } = useFastingToday();

  if (isLoading || !data) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  const feastToday = data.feasts_today?.[0];
  const variant = feastToday ? "feast" : data.is_fasting ? "fasting" : "normal";

  return (
    <div className="space-y-6">
      {/* Status card */}
      <div
        className={cn(
          "rounded-2xl border p-6",
          variant === "feast" && "border-gold-500/30 bg-gold-500/[0.05]",
          variant === "fasting" && "border-amber-500/30 bg-amber-500/[0.04]",
          variant === "normal" && "border-surface-border bg-surface-raised/20",
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
              variant === "feast" &&
                "bg-gold-500/15 text-gold-500 ring-1 ring-gold-500/30",
              variant === "fasting" &&
                "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30",
              variant === "normal" &&
                "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25",
            )}
          >
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <p className="font-amharic text-2xl font-semibold text-text-primary">
              {feastToday
                ? feastToday.name_am
                : data.is_fasting
                  ? "ዛሬ ጾም ነው"
                  : "ዛሬ ጾም አይደለም"}
            </p>
            <p className="mt-1 font-amharic text-[14px] text-text-muted">
              {data.ethiopian.display}
            </p>
          </div>
        </div>

        {data.reason_am && (
          <p className="mt-5 font-amharic text-[14px] leading-[1.9] text-text-secondary">
            <span className="text-text-faint">ምክንያት: </span>
            {data.reason_am}
          </p>
        )}
      </div>

      {/* Feasts today */}
      {data.feasts_today && data.feasts_today.length > 0 && (
        <section>
          <h3 className="mb-3 font-amharic text-[13px] font-semibold uppercase tracking-wider text-text-faint">
            የዛሬ በዓላት
          </h3>
          <ul className="space-y-2">
            {data.feasts_today.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-surface-border bg-surface-raised/20 p-4"
              >
                <p className="font-amharic text-[15px] font-medium text-text-primary">
                  {f.name_am}
                </p>
                {f.description_am && (
                  <p className="mt-1 font-amharic text-[13px] leading-[1.8] text-text-muted">
                    {f.description_am}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Explainer */}
      <section className="rounded-xl border border-surface-border bg-surface-raised/10 p-5">
        <h3 className="mb-2 font-amharic text-[14px] font-semibold text-text-primary">
          ስለ ጾም
        </h3>
        <p className="font-amharic text-[14px] leading-[1.9] text-text-secondary">
          በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ሥርዓት መሠረት፥ ረቡዕና ዓርብ የጾም ቀናት ናቸው። በተጨማሪም
          የተለያዩ የጾም ወቅቶች — አብይ ጾም፣ ጾመ ነነዌ፣ ጾመ ሐዋርያት፣ ጾመ ፍልሰታ፣ እና ጾመ ገና — በዓመቱ
          ውስጥ ይከበራሉ።
        </p>
      </section>
    </div>
  );
}
