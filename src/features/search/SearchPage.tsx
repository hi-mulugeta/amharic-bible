import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SearchX, Sparkles, SlidersHorizontal } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "./SearchResults";
import { ReferenceResults } from "./ReferenceResults";
import { AdvancedSyntaxHelp } from "./AdvancedSyntaxHelp";
import { useUnifiedSearch } from "@/api/queries/search";
import { useDebounced } from "@/lib/useDebounced";
import { EmptyState } from "@/components/ui/EmptyState";
import { parseReference } from "@/lib/parseReference";
import { analyzeAdvancedQuery } from "@/lib/parseAdvancedQuery";
import { cn } from "@/lib/utils";

type Scope = "all" | "verses" | "commentaries";
type SearchMode = "simple" | "advanced";

const SCOPES: Array<{ key: Scope; label: string }> = [
  { key: "all", label: "ሁሉም" },
  { key: "verses", label: "ጥቅሶች" },
  { key: "commentaries", label: "ትርጓሜ" },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const urlQ = params.get("q") ?? "";
  const scope = (params.get("scope") as Scope) ?? "all";
  const searchMode = (params.get("mode") as SearchMode) ?? "simple";

  const [inputValue, setInputValue] = useState(urlQ);
  const debouncedInput = useDebounced(inputValue, 400);

  // Sync input with URL
  useEffect(() => {
    if (urlQ !== inputValue) setInputValue(urlQ);
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

  const setSearchMode = useCallback(
    (m: SearchMode) => {
      const next = new URLSearchParams(params);
      next.set("mode", m);
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

  const hasQuery = urlQ.trim().length >= 2;
  const parsedRef = hasQuery ? parseReference(urlQ) : null;
  const isReference = parsedRef !== null;

  // Analyze advanced syntax (only useful when mode=advanced)
  const analysis = hasQuery
    ? analyzeAdvancedQuery(urlQ)
    : { operators: [], hasAdvancedSyntax: false, error: null };

  const { data, isLoading, isError, error } = useUnifiedSearch(urlQ, scope, {
    mode: searchMode === "advanced" ? "advanced" : "both",
  });

  const totalResults =
    (data?.results.verses.length ?? 0) +
    (data?.results.commentaries.length ?? 0);

  // Error from backend (invalid advanced syntax)
  const backendError =
    error && (error as { status?: number }).status === 400
      ? (error as { messageAm?: string; message?: string })
      : null;

  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:px-8 md:py-14">
      <header className="mb-6 flex items-end justify-between">
        <h1 className="font-amharic text-2xl font-semibold text-text-primary md:text-3xl">
          ፍለጋ
        </h1>
        {searchMode === "advanced" && <AdvancedSyntaxHelp />}
      </header>

      <div className="mb-4">
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={submitNow}
          autoFocus={!hasQuery}
          placeholder={
            searchMode === "advanced"
              ? 'ምሳሌ: ኢየሱስ AND ዳዊት · "የኢየሱስ ክርስቶስ" · ኢየሱስ <3> ዳዊት'
              : "ጥቅስ፣ ትርጓሜ ወይም ቅዱስ ፈልግ..."
          }
        />
      </div>

      {/* Mode toggle */}
      {hasQuery && !isReference && (
        <div className="mb-4 inline-grid grid-cols-2 gap-1 rounded-lg border border-surface-border bg-surface-raised/20 p-1">
          <button
            type="button"
            onClick={() => setSearchMode("simple")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-amharic text-[13px] font-medium transition-colors",
              searchMode === "simple"
                ? "bg-surface-raised text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            ቀላል
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("advanced")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-amharic text-[13px] font-medium transition-colors",
              searchMode === "advanced"
                ? "bg-surface-raised text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            <Sparkles className="h-3 w-3" />
            የላቀ
          </button>
        </div>
      )}

      {/* Advanced syntax detected — chips */}
      {hasQuery &&
        searchMode === "advanced" &&
        analysis.operators.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="font-amharic text-[11px] uppercase tracking-wider text-text-faint">
              የተለዩ ምልክቶች:
            </span>
            {analysis.operators.map((op, i) => (
              <span
                key={i}
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 font-mono text-[11px]",
                  op.kind === "and" || op.kind === "or" || op.kind === "not"
                    ? "bg-gold-500/15 text-gold-500"
                    : op.kind === "phrase"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-sky-500/15 text-sky-400",
                )}
              >
                {op.text}
              </span>
            ))}
          </div>
        )}

      {/* Advanced syntax error */}
      {searchMode === "advanced" && analysis.error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/[0.05] p-3">
          <p className="font-amharic text-[13px] text-red-400">
            {analysis.error}
          </p>
        </div>
      )}

      {/* Backend error (invalid advanced syntax) */}
      {backendError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/[0.05] p-3">
          <p className="font-amharic text-[13px] text-red-400">
            {backendError.messageAm || backendError.message || "የፍለጋ ስህተት"}
          </p>
        </div>
      )}

      {/* Scope toggle — hidden in advanced mode and for reference queries */}
      {hasQuery && !isReference && searchMode === "simple" && (
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

      {/* In advanced mode, add a small scope selector too */}
      {hasQuery && searchMode === "advanced" && !isReference && (
        <div className="mb-6 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-text-faint" />
          {SCOPES.map((s) => {
            const active = s.key === scope;
            return (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={cn(
                  "rounded-full border px-3 py-1 font-amharic text-[12px] transition-colors",
                  active
                    ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                    : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
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
          hintAm="የሚፈልጉትን ጥቅስ፣ ትርጓሜ ወይም ቅዱስ ይጻፉ። እንደ 'ማቴ 1:1' ያለ ቀጥታ ጥቅስም ይሞክሩ።"
          className="py-20"
        />
      ) : isReference ? (
        <>
          <ReferenceResults query={urlQ} />
          {totalResults > 0 && (
            <section>
              <header className="mb-3 flex items-center justify-between">
                <h2 className="font-amharic text-[13px] font-semibold uppercase tracking-wider text-text-faint">
                  ተዛማጅ ውጤቶች
                </h2>
              </header>
              <SearchResults
                data={data}
                isLoading={isLoading}
                isError={isError}
                scope={scope}
                totalResults={totalResults}
              />
            </section>
          )}
        </>
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
