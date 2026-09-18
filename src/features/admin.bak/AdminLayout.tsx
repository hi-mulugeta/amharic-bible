import { useSearchParams, Link } from "react-router-dom";
import {
  Compass,
  Hash,
  Users,
  BookOpen,
  Scroll,
  MessageSquare,
  Church,
  Book,
  Type,
  MessagesSquare,
  History,
} from "lucide-react";
import { AdminGuard } from "./AdminGuard";
import { AdminTopicsTab } from "./AdminTopicsTab";
import { AdminTagsTab } from "./AdminTagsTab";
import { AdminSaintsTab } from "./AdminSaintsTab";
import { AdminAuthorsTab } from "./AdminAuthorsTab";
import { AdminSourcesTab } from "./AdminSourcesTab";
import { AdminCommentariesTab } from "./AdminCommentariesTab";
import { AdminLiturgyTab } from "./AdminLiturgyTab";
import { AdminBooksTab } from "./AdminBooksTab";
import { AdminVersesTab } from "./AdminVersesTab";
import { AdminCommentsTab } from "./AdminCommentsTab";
import { AdminAuditTab } from "./AdminAuditTab";
import { cn } from "@/lib/utils";

type Tab =
  | "commentaries"
  | "authors"
  | "sources"
  | "liturgy"
  | "books"
  | "verses"
  | "comments"
  | "topics"
  | "tags"
  | "saints"
  | "audit";

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  {
    key: "commentaries",
    label: "ትርጓሜዎች",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  { key: "authors", label: "ደራሲያን", icon: <Users className="h-4 w-4" /> },
  { key: "sources", label: "ምንጮች", icon: <Scroll className="h-4 w-4" /> },
  { key: "liturgy", label: "ሥርዓት", icon: <Church className="h-4 w-4" /> },
  { key: "books", label: "መጻሕፍት", icon: <Book className="h-4 w-4" /> },
  { key: "verses", label: "ጥቅሶች", icon: <Type className="h-4 w-4" /> },
  {
    key: "comments",
    label: "አስተያየቶች",
    icon: <MessagesSquare className="h-4 w-4" />,
  },
  { key: "topics", label: "ርዕሶች", icon: <Compass className="h-4 w-4" /> },
  { key: "tags", label: "መለያዎች", icon: <Hash className="h-4 w-4" /> },
  { key: "saints", label: "ቅዱሳን", icon: <BookOpen className="h-4 w-4" /> },
  { key: "audit", label: "የለውጥ ማስታወሻ", icon: <History className="h-4 w-4" /> },
];

export function AdminLayout() {
  return (
    <AdminGuard>
      <AdminInner />
    </AdminGuard>
  );
}

function AdminInner() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) ?? "commentaries";

  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    p.set("tab", next);
    setParams(p, { replace: true });
  };

  return (
    <div className="mx-auto max-w-shell px-5 py-10 md:px-8 md:py-14">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="font-amharic text-2xl font-semibold text-text-primary md:text-3xl">
            አስተዳደር
          </h1>
          <p className="mt-1 font-amharic text-[14px] text-text-muted">
            ይዘት ይፍጠሩ፣ ያሻሽሉ፣ ያስተዳድሩ።
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

      {tab === "commentaries" && <AdminCommentariesTab />}
      {tab === "authors" && <AdminAuthorsTab />}
      {tab === "sources" && <AdminSourcesTab />}
      {tab === "liturgy" && <AdminLiturgyTab />}
      {tab === "books" && <AdminBooksTab />}
      {tab === "verses" && <AdminVersesTab />}
      {tab === "comments" && <AdminCommentsTab />}
      {tab === "topics" && <AdminTopicsTab />}
      {tab === "tags" && <AdminTagsTab />}
      {tab === "saints" && <AdminSaintsTab />}
      {tab === "audit" && <AdminAuditTab />}
    </div>
  );
}
