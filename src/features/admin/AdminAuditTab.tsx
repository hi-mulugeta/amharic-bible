import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  History,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { request } from "@/api/client";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type AuditEntry = {
  id: number;
  user_email: string | null;
  action: "create" | "update" | "delete";
  entity: string;
  entity_id: string | null;
  changes: string;
  ip_address: string | null;
  created_at: string;
};

type PageMeta = {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

const PER_PAGE = 50;

const inputClass = cn(
  "rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3 py-1.5",
  "font-amharic text-[13px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:outline-none",
);

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "አሁን";
  if (diffMin < 60) return `ከ ${diffMin} ደቂቃ በፊት`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `ከ ${diffHr} ሰዓት በፊት`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `ከ ${diffDay} ቀን በፊት`;
  return new Date(iso).toLocaleDateString();
}

export function AdminAuditTab() {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["admin", "audit-log", page, entity, action, userEmail],
    queryFn: () =>
      request<{ data: AuditEntry[]; meta: PageMeta }>("/api/admin/audit-log", {
        query: {
          page,
          per_page: PER_PAGE,
          entity: entity || undefined,
          action: action || undefined,
          user_email: userEmail || undefined,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setEntity("");
    setAction("");
    setUserEmail("");
    setPage(1);
  };

  const hasFilters = entity || action || userEmail;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-text-faint" />

        <select
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">ሁሉም ዓይነቶች</option>
          <option value="translation">ትርጉም</option>
          <option value="book">መጽሐፍ</option>
          <option value="verse">ጥቅስ</option>
          <option value="author">ደራሲ</option>
          <option value="commentary">ትርጓሜ</option>
          <option value="commentary_source">ምንጭ</option>
          <option value="topic">ርዕስ</option>
          <option value="tag">መለያ</option>
          <option value="saint">ቅዱስ</option>
          <option value="feast_day">በዓል</option>
          <option value="lectionary_reading">ምንባብ</option>
          <option value="prayer">ጸሎት</option>
          <option value="verse_of_day">የዕለቱ ጥቅስ</option>
          <option value="cross_reference">ግንኙነት</option>
          <option value="verse_comment">አስተያየት</option>
        </select>

        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">ሁሉም ተግባሮች</option>
          <option value="create">መፍጠር</option>
          <option value="update">ማሻሻል</option>
          <option value="delete">መሰረዝ</option>
        </select>

        <input
          type="text"
          value={userEmail}
          onChange={(e) => {
            setUserEmail(e.target.value);
            setPage(1);
          }}
          placeholder="ተጠቃሚ ኢሜይል..."
          className={cn(inputClass, "w-48")}
        />

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="font-amharic text-[12px] text-text-muted transition-colors hover:text-text-primary"
          >
            አጽዳ
          </button>
        )}

        {meta && (
          <span className="ml-auto text-[12px] tabular-nums text-text-faint">
            {meta.total} ለውጦች
          </span>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="የለውጥ ማስታወሻ መጫን አልተቻለም።" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<History />}
          titleAm="ለውጥ የለም"
          hintAm={
            hasFilters ? "በዚህ ማጣሪያ ውስጥ ምንም ለውጥ የለም።" : "እስካሁን ምንም ለውጥ አልተመዘገበም።"
          }
        />
      ) : (
        <>
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-surface-border transition-opacity",
              isFetching ? "opacity-60" : "opacity-100",
            )}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface-raised/20 text-left">
                  <th className="w-12 px-4 py-3" />
                  <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                    ተግባር
                  </th>
                  <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                    ዓይነት
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ተጠቃሚ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                    ጊዜ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((entry) => {
                  const isExpanded = expanded.has(entry.id);
                  return (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpand(entry.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <AuditPagination meta={meta} onPageChange={setPage} />
          )}
        </>
      )}
    </>
  );
}

function AuditPagination({
  meta,
  onPageChange,
}: {
  meta: PageMeta;
  onPageChange: (p: number) => void;
}) {
  const { page, pages, total, per_page } = meta;
  const canPrev = page > 1;
  const canNext = page < pages;

  const start = (page - 1) * per_page + 1;
  const end = Math.min(page * per_page, total);

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="text-[12px] tabular-nums text-text-faint">
        {start}–{end} / {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
            canPrev
              ? "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              : "cursor-not-allowed text-text-faint opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="font-amharic">ቀዳሚ</span>
        </button>

        <span className="text-[13px] tabular-nums text-text-muted">
          {page} / {pages}
        </span>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
            canNext
              ? "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              : "cursor-not-allowed text-text-faint opacity-40",
          )}
        >
          <span className="font-amharic">ቀጣይ</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

function EntryRow({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: AuditEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const actionColor =
    entry.action === "create"
      ? "text-emerald-400 bg-emerald-500/15"
      : entry.action === "update"
        ? "text-amber-400 bg-amber-500/15"
        : "text-red-400 bg-red-500/15";

  const actionLabel =
    entry.action === "create"
      ? "ፍጠር"
      : entry.action === "update"
        ? "አዘምን"
        : "ሰርዝ";

  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-surface-raised/10"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-text-faint transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
              actionColor,
            )}
          >
            {actionLabel}
          </span>
        </td>
        <td className="px-4 py-3">
          <code className="rounded bg-surface-raised px-1.5 py-0.5 text-[12px] text-text-muted">
            {entry.entity}
          </code>
          {entry.entity_id && (
            <span className="ml-2 text-[11px] tabular-nums text-text-faint">
              #{entry.entity_id}
            </span>
          )}
        </td>
        <td className="hidden px-4 py-3 md:table-cell">
          <span className="truncate text-[12px] text-text-muted">
            {entry.user_email ?? "—"}
          </span>
        </td>
        <td className="hidden px-4 py-3 sm:table-cell">
          <span className="text-[12px] text-text-faint">
            {relativeTime(entry.created_at)}
          </span>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-surface-sunken/40">
          <td colSpan={5} className="px-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[11px] text-text-faint">
                {entry.ip_address && (
                  <span>
                    IP:{" "}
                    <code className="text-text-muted">{entry.ip_address}</code>
                  </span>
                )}
                <span>{new Date(entry.created_at).toLocaleString()}</span>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-surface-border bg-surface-sunken/60 p-3 text-[12px] leading-[1.6] text-text-secondary">
                {formatChanges(entry.changes)}
              </pre>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function formatChanges(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
