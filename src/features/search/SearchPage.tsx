import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "./SearchResults";
import { useUnifiedSearch } from "@/api/queries/search";
import { useDebounced } from "@/lib/useDebounced";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type Scope = "all" | "verses" | "commentaries";

const SCOPES: Array<{ key: Scope; label: string }> = [
  { key: "all", label: "ሁሉም" },
  { key: "verses", label: "ጥቅሶች" },
  { key: "commentaries", label: "ትርጓሜ" },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // URL is the source of truth
  const urlQ = params.get("q") ?? "";
  const scope = (params.get("scope") as Scope) ?? "all";

  // Local input state, synced to URL on debounce
  const [inputValue, setInputValue] = useState(urlQ);
  const debouncedInput = useDebounced(inputValue, 400);

  // Keep input in sync when URL changes (e.g., back/forward)
  useEffect(() => {
    if (urlQ !== inputValue) {
      setInputValue(urlQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ]);

  // Push debounced input to URL
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (debouncedInput.trim() === current) return;

    const next = new URLSearchParams(params);
    if (debouncedInput.trim().length >= 2) {
      next.set("q", debouncedInput.trim());
    } else {
      next.delete("q");
    }
    // Reset page on new query
    next.delete("page");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  const setScope = useCallback(
    (s: Scope) => {
      const next = new URLSearchParams(params);
      next.set("scope", s);
      next.delete("page");
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const submitNow = useCallback(
    (v: string) => {
      const next = new URLSearchParams(params);
      next.set("q", v);
      next.delete("page");
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const { data, isLoading, isError } = useUnifiedSearch(urlQ, scope);

  const hasQuery = urlQ.trim().length >= 2;
  const totalResults =
    (data?.results.verses.length ?? 0) +
    (data?.results.commentaries.length ?? 0);

  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:px-8 md:py-14">
      <header className="mb-6">
        <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
          ፍለጋ
        </h1>
      </header>

      {/* Search input */}
      <div className="mb-5">
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={submitNow}
          autoFocus={!hasQuery}
        />
      </div>

      {/* Scope toggle */}
      {hasQuery && (
        <div className="mb-8 grid grid-cols-3 gap-1 rounded-lg border border-surface-border bg-surface-raised/20 p-1">
          {SCOPES.map((s) => {
            const active = s.key === scope;
            return (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={cn(
                  "rounded-md py-2 font-amharic text-[14px] font-medium transition-colors",
                  active
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {!hasQuery ? (
        <EmptyState
          icon={<SearchX />}
          titleAm="ፍለጋ ይጀምሩ"
          hintAm="የሚፈልጉትን ጥቅስ፣ ትርጓሜ ወይም ቅዱስ ይጻፉ።"
          className="py-20"
        />
      ) : (
        <SearchResults
          data={data}
          isLoading={isLoading}
          isError={isError}
          scope={scope}
          totalResults={totalResults}
        />
      )}

      <div className="h-16" />
    </div>
  );
}
