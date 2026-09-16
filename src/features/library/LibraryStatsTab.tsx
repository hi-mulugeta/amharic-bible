import {
  Bookmark,
  FileText,
  Highlighter,
  BookOpen,
  Flame,
  TrendingUp,
  Award,
} from "lucide-react";
import { useUserStats } from "@/api/queries/user";
import { Skeleton } from "@/components/ui/Skeleton";
// import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function LibraryStatsTab() {
  const { data, isLoading } = useUserStats();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero — streak */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StreakCard
          icon={<Flame className="h-5 w-5" />}
          label="የአሁኑ ሰንሰለት"
          value={data.current_streak_days}
          hint="ተከታታይ ቀናት"
          variant="primary"
        />
        <StreakCard
          icon={<Award className="h-5 w-5" />}
          label="ረዥሙ ሰንሰለት"
          value={data.longest_streak_days}
          hint="ከሁሉም ረዥሙ"
          variant="muted"
        />
      </section>

      {/* Content counts */}
      <section>
        <h3 className="mb-3 font-amharic text-[13px] font-medium uppercase tracking-wider text-text-faint">
          የተቀመጡ
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Bookmark className="h-4 w-4" />}
            label="ቅጥሎች"
            value={data.bookmarks}
          />
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="ማስታወሻዎች"
            value={data.notes}
          />
          <StatCard
            icon={<Highlighter className="h-4 w-4" />}
            label="አድማሚዎች"
            value={data.highlights}
          />
        </div>
      </section>

      {/* Reading progress */}
      <section>
        <h3 className="mb-3 font-amharic text-[13px] font-medium uppercase tracking-wider text-text-faint">
          ንባብ
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<BookOpen className="h-4 w-4" />}
            label="የተነበቡ ምዕራፎች"
            value={data.chapters_read}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="የተነበቡ መጻሕፍት"
            value={data.distinct_books_read}
          />
        </div>
      </section>
    </div>
  );
}

function StreakCard({
  icon,
  label,
  value,
  hint,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  variant: "primary" | "muted";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-5",
        variant === "primary"
          ? "border-gold-500/30 bg-gold-500/[0.05]"
          : "border-surface-border bg-surface-raised/20",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          variant === "primary"
            ? "bg-gold-500/15 text-gold-500 ring-1 ring-gold-500/30"
            : "bg-surface-raised text-text-muted ring-1 ring-surface-border",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
          {label}
        </p>
        <p className="mt-1 font-amharic text-3xl font-semibold text-text-primary tabular-nums">
          {value}
        </p>
        <p className="mt-0.5 font-amharic text-[12px] text-text-muted">
          {hint}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised/20 p-4">
      <div className="flex items-center gap-2 text-text-faint">
        {icon}
        <span className="font-amharic text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 font-amharic text-2xl font-semibold text-text-primary tabular-nums">
        {value}
      </p>
    </div>
  );
}
