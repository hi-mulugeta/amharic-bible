import { Leaf, Sparkles } from "lucide-react";
import { useFastingToday } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function FastingChip() {
  const { data, isLoading } = useFastingToday();

  if (isLoading) return <Skeleton className="h-7 w-32 rounded-full" />;
  if (!data) return null;

  const feastsToday = Array.isArray(data.feasts_today) ? data.feasts_today : [];
  const feastToday = feastsToday.length > 0;

  // A feast takes precedence over the fasting state
  if (feastToday) {
    const feast = feastsToday[0]!;
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1",
          "bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/30",
        )}
        title={feast.description_am ?? undefined}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="font-amharic text-[13px] font-medium">
          {feast.name_am}
        </span>
      </div>
    );
  }

  if (data.is_fasting) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1",
          "bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/25",
        )}
        title={data.reason_am ?? "የጾም ቀን"}
      >
        <Leaf className="h-3.5 w-3.5" />
        <span className="font-amharic text-[13px] font-medium">ዛሬ ጾም</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1",
        "bg-surface-raised text-text-muted ring-1 ring-surface-border",
      )}
    >
      <span className="font-amharic text-[13px]">ዛሬ ጾም አይደለም</span>
    </div>
  );
}
