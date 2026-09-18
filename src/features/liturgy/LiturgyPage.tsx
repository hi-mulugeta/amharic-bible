import { useSearchParams, Link } from "react-router-dom";
import { Sun, Users, Calendar, BookOpen, Leaf } from "lucide-react";
import { LiturgyTodayTab } from "./LiturgyTodayTab";
import { LiturgySaintsTab } from "./LiturgySaintsTab";
import { LiturgyFeastsTab } from "./LiturgyFeastsTab";
import { LiturgyPrayersTab } from "./LiturgyPrayersTab";
import { LiturgyFastingTab } from "./LiturgyFastingTab";
import { cn } from "@/lib/utils";

type Tab = "today" | "saints" | "feasts" | "prayers" | "fasting";

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: "today", label: "ዛሬ", icon: <Sun className="h-4 w-4" /> },
  { key: "saints", label: "ቅዱሳን", icon: <Users className="h-4 w-4" /> },
  { key: "feasts", label: "በዓላት", icon: <Calendar className="h-4 w-4" /> },
  { key: "prayers", label: "ጸሎቶች", icon: <BookOpen className="h-4 w-4" /> },
  { key: "fasting", label: "ጾም", icon: <Leaf className="h-4 w-4" /> },
];

export function LiturgyPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) ?? "today";

  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    p.set("tab", next);
    setParams(p, { replace: true });
  };

  return (
    <div className="mx-auto max-w-shell px-5 py-10 md:px-8 md:py-14">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
            ሥርዓተ ቤተ ክርስቲያን
          </h1>
          <p className="mt-1 font-amharic text-[14px] text-text-muted">
            የዕለቱ ምንባብ፣ ቅዱሳን፣ በዓላትና ጸሎቶች።
          </p>
        </div>
        <Link
          to="/"
          className="font-amharic text-[13px] text-text-muted transition-colors hover:text-text-primary"
        >
          ወደ መነሻ →
        </Link>
      </header>

      <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-surface-border">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-2 px-4 py-2.5 font-amharic text-[14px] font-medium transition-colors",
                active
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {t.icon}
              {t.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-gold-500" />
              )}
            </button>
          );
        })}
      </nav>

      {tab === "today" && <LiturgyTodayTab />}
      {tab === "saints" && <LiturgySaintsTab />}
      {tab === "feasts" && <LiturgyFeastsTab />}
      {tab === "prayers" && <LiturgyPrayersTab />}
      {tab === "fasting" && <LiturgyFastingTab />}

      <div className="h-16" />
    </div>
  );
}
