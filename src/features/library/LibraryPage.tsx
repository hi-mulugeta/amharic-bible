import { useSearchParams, Link } from "react-router-dom";
import {
  Bookmark,
  FileText,
  Highlighter,
  History,
  BarChart3,
} from "lucide-react";
import { LibraryBookmarksTab } from "./LibraryBookmarksTab";
import { LibraryNotesTab } from "./LibraryNotesTab";
import { LibraryHighlightsTab } from "./LibraryHighlightsTab";
import { LibraryHistoryTab } from "./LibraryHistoryTab";
import { LibraryStatsTab } from "./LibraryStatsTab";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

type Tab = "bookmarks" | "notes" | "highlights" | "history" | "stats";

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: "bookmarks", label: "ቅጥሎች", icon: <Bookmark className="h-4 w-4" /> },
  { key: "notes", label: "ማስታወሻዎች", icon: <FileText className="h-4 w-4" /> },
  {
    key: "highlights",
    label: "አድማሚዎች",
    icon: <Highlighter className="h-4 w-4" />,
  },
  { key: "history", label: "ታሪክ", icon: <History className="h-4 w-4" /> },
  { key: "stats", label: "ስታቲስቲክስ", icon: <BarChart3 className="h-4 w-4" /> },
];

export function LibraryPage() {
  return (
    <ProtectedRoute>
      <LibraryInner />
    </ProtectedRoute>
  );
}

function LibraryInner() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) ?? "bookmarks";

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
            የእኔ ቤተ መጻሕፍት
          </h1>
          <p className="mt-1 font-amharic text-[14px] text-text-muted">
            ያስቀመጡት፣ የጻፉት፣ ያደመቁት፣ ያነበቡት።
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

      {tab === "bookmarks" && <LibraryBookmarksTab />}
      {tab === "notes" && <LibraryNotesTab />}
      {tab === "highlights" && <LibraryHighlightsTab />}
      {tab === "history" && <LibraryHistoryTab />}
      {tab === "stats" && <LibraryStatsTab />}

      <div className="h-16" />
    </div>
  );
}
