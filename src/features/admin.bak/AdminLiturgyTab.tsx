import { useState } from "react";
import {
  Calendar,
  BookOpen,
  Sun,
  Scroll,
  User as UserIcon,
  Link2,
} from "lucide-react";
import { AdminFeastDaysTab } from "./AdminFeastDaysTab";
import { AdminPrayersTab } from "./AdminPrayersTab";
import { AdminVotdTab } from "./AdminVotdTab";
import { AdminReadingsTab } from "./AdminReadingsTab";
import { AdminSaintsTab } from "./AdminSaintsTab";
import { AdminCrossReferencesTab } from "./AdminCrossReferencesTab";
import { cn } from "@/lib/utils";

type SubTab = "feasts" | "readings" | "saints" | "prayers" | "votd" | "xrefs";

const SUB_TABS: Array<{ key: SubTab; label: string; icon: React.ReactNode }> = [
  { key: "feasts", label: "በዓላት", icon: <Calendar className="h-3.5 w-3.5" /> },
  { key: "readings", label: "ምንባብ", icon: <Scroll className="h-3.5 w-3.5" /> },
  { key: "saints", label: "ቅዱሳን", icon: <UserIcon className="h-3.5 w-3.5" /> },
  { key: "prayers", label: "ጸሎቶች", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "votd", label: "የዕለቱ ጥቅስ", icon: <Sun className="h-3.5 w-3.5" /> },
  { key: "xrefs", label: "ግንኙነቶች", icon: <Link2 className="h-3.5 w-3.5" /> },
];

export function AdminLiturgyTab() {
  const [sub, setSub] = useState<SubTab>("feasts");
  return (
    <div className="space-y-6">
      <div className="inline-grid grid-cols-6 gap-1 rounded-lg border border-surface-border bg-surface-raised/20 p-1">
        {SUB_TABS.map((t) => {
          const active = t.key === sub;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSub(t.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-amharic text-[13px] font-medium transition-colors",
                active
                  ? "bg-surface-raised text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {sub === "feasts" && <AdminFeastDaysTab />}
      {sub === "readings" && <AdminReadingsTab />}
      {sub === "saints" && <AdminSaintsTab />}
      {sub === "prayers" && <AdminPrayersTab />}
      {sub === "votd" && <AdminVotdTab />}
      {sub === "xrefs" && <AdminCrossReferencesTab />}
    </div>
  );
}
