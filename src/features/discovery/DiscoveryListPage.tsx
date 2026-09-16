import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Compass, Hash } from "lucide-react";
import {
  useTopics,
  useTags,
  type TopicOut,
  type TagOut,
} from "@/api/queries/discovery";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounced } from "@/lib/useDebounced";
import { cn } from "@/lib/utils";

type Kind = "topics" | "tags";

export function DiscoveryListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive kind from the URL — /topics or /tags
  const kind: Kind = location.pathname.startsWith("/tags") ? "tags" : "topics";

  const switchKind = (next: Kind) => {
    navigate(`/${next}`, { replace: false });
  };

  return (
    <div className="mx-auto max-w-shell px-5 py-10 md:px-8 md:py-14">
      <header className="mb-6">
        <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
          ማሰስ
        </h1>
        <p className="mt-2 font-amharic text-[14px] text-text-muted max-w-prose">
          በርዕስ ወይም በመለያ የተደራጁ ጥቅሶች።
        </p>
      </header>

      {/* Kind toggle */}
      <div className="mb-8 inline-grid grid-cols-2 gap-1 rounded-lg border border-surface-border bg-surface-raised/20 p-1">
        <ToggleTab
          active={kind === "topics"}
          onClick={() => switchKind("topics")}
          icon={<Compass className="h-3.5 w-3.5" />}
          label="ርዕሶች"
        />
        <ToggleTab
          active={kind === "tags"}
          onClick={() => switchKind("tags")}
          icon={<Hash className="h-3.5 w-3.5" />}
          label="መለያዎች"
        />
      </div>

      {kind === "topics" ? <TopicsSection /> : <TagsSection />}

      <div className="h-16" />
    </div>
  );
}

function ToggleTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-4 py-2 font-amharic text-[14px] font-medium transition-colors",
        active
          ? "bg-surface-raised text-text-primary"
          : "text-text-secondary hover:text-text-primary",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ------------------------------------------------------------
// Topics
// ------------------------------------------------------------

function TopicsSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search, 300);

  const { data, isLoading, isFetching, isError } = useTopics({
    page,
    q: debounced,
  });

  const topics = Array.isArray(data?.data) ? data!.data : [];
  const meta = data?.meta;

  return (
    <>
      <div className="mb-8 max-w-md">
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="ርዕስ ፈልግ..."
        />
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={<Compass />}
          titleAm="ስህተት ተፈጥሯል"
          hintAm="ርዕሶችን መጫን አልተቻለም።"
        />
      ) : topics.length === 0 ? (
        <EmptyState
          icon={<Compass />}
          titleAm={debounced ? "ውጤት አልተገኘም" : "ርዕስ አልተገኘም"}
          hintAm={debounced ? "ሌላ ቃል ይሞክሩ።" : "እስካሁን ርዕስ አልተመዘገበም።"}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity",
              isFetching ? "opacity-60" : "opacity-100",
            )}
          >
            {topics.map((t) => (
              <TopicCard key={t.slug} topic={t} />
            ))}
          </div>
          {meta && meta.pages > 1 && (
            <div className="mt-10">
              <Pagination
                page={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

function TopicCard({ topic }: { topic: TopicOut }) {
  return (
    <Link
      to={`/topics/${topic.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised/20 p-5 transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40"
    >
      <h3 className="font-amharic text-[16px] font-semibold text-text-primary group-hover:text-gold-400 transition-colors">
        {topic.name_am}
      </h3>
      {topic.name_en && (
        <p className="text-[12px] text-text-muted truncate">{topic.name_en}</p>
      )}
      {topic.description_am && (
        <p className="mt-1 font-amharic text-[13px] leading-[1.7] text-text-faint line-clamp-3">
          {topic.description_am}
        </p>
      )}
    </Link>
  );
}

// ------------------------------------------------------------
// Tags
// ------------------------------------------------------------

function TagsSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useTags({ page });

  const tags = Array.isArray(data?.data) ? data!.data : [];
  const meta = data?.meta;

  return (
    <>
      {isLoading ? (
        <GridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={<Hash />}
          titleAm="ስህተት ተፈጥሯል"
          hintAm="መለያዎችን መጫን አልተቻለም።"
        />
      ) : tags.length === 0 ? (
        <EmptyState
          icon={<Hash />}
          titleAm="መለያ አልተገኘም"
          hintAm="እስካሁን መለያ አልተመዘገበም።"
        />
      ) : (
        <>
          <div
            className={cn(
              "flex flex-wrap gap-2 transition-opacity",
              isFetching ? "opacity-60" : "opacity-100",
            )}
          >
            {tags.map((t) => (
              <TagPill key={t.slug} tag={t} />
            ))}
          </div>
          {meta && meta.pages > 1 && (
            <div className="mt-10">
              <Pagination
                page={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

function TagPill({ tag }: { tag: TagOut }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      className="group inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-raised/20 px-3.5 py-1.5 transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40"
    >
      <Hash className="h-3 w-3 text-text-faint" />
      <span className="font-amharic text-[14px] text-text-secondary group-hover:text-text-primary">
        {tag.name_am}
      </span>
    </Link>
  );
}

// ------------------------------------------------------------
// Shared bits
// ------------------------------------------------------------

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-surface-border bg-surface-raised/20",
          "py-2.5 pl-10 pr-4",
          "font-amharic text-[14px] text-text-primary placeholder:text-text-faint",
          "transition-colors",
          "focus:border-gold-500/40 focus:bg-surface-raised/40 focus:outline-none",
        )}
      />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}
