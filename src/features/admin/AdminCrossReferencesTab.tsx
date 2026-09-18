import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request, ApiRequestError } from "@/api/client";
import { useAdminCrossReferences } from "@/api/queries/admin";
import { useBooks, useChapter } from "@/api/queries/bible";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

export function AdminCrossReferencesTab() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isError, isFetching } = useAdminCrossReferences({
    page,
  });
  const items = data?.data ?? [];
  const meta = data?.meta;
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      request<void>(`/api/admin/discovery/cross-references/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "discovery-cross-refs"] });
    },
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-amharic text-[13px] text-text-muted">
          በጥቅሶች መካከል ያሉ ግንኙነቶች።
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          አዲስ ግንኙነት
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ግንኙነቶችን መጫን አልተቻለም።" />
      ) : items.length === 0 ? (
        <EmptyState
          titleAm="ግንኙነት የለም"
          hintAm="የመጀመሪያውን የጥቅስ ግንኙነት ይፍጠሩ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ግንኙነት
            </Button>
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
                  <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                    ከ
                  </th>
                  <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                    ወደ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ዓይነት
                  </th>
                  <th className="w-[100px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((r) => (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      {r.source_ref && (
                        <Link
                          to={`/bible/${r.source_ref.book_slug}/${r.source_ref.chapter}?verse=${r.source_ref.verse_number}`}
                          className="font-amharic text-[13px] text-gold-500/80 hover:underline"
                        >
                          {r.source_ref.book_name_am}{" "}
                          {toEthiopicNumeral(r.source_ref.chapter)}:
                          {toEthiopicNumeral(r.source_ref.verse_number)}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.target_ref && (
                        <Link
                          to={`/bible/${r.target_ref.book_slug}/${r.target_ref.chapter}?verse=${r.target_ref.verse_number}`}
                          className="font-amharic text-[13px] text-gold-500/80 hover:underline"
                        >
                          {r.target_ref.book_name_am}{" "}
                          {toEthiopicNumeral(r.target_ref.chapter)}:
                          {toEthiopicNumeral(r.target_ref.verse_number)}
                        </Link>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <code className="rounded bg-surface-raised px-1.5 py-0.5 text-[12px] text-text-muted">
                        {r.relation}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmButton
                        onConfirm={() => deleteMutation.mutate(r.id)}
                        busy={deleteMutation.isPending}
                      >
                        ሰርዝ
                      </ConfirmButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.pages > 1 && (
            <div className="mt-8">
              <Pagination
                page={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <CrossReferenceCreateModal open={creating} onOpenChange={setCreating} />
    </>
  );
}

type VerseSelection = {
  book_slug: string;
  chapter: number;
  verse_number: number | null;
};

function CrossReferenceCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [source, setSource] = useState<VerseSelection>({
    book_slug: "matthew",
    chapter: 1,
    verse_number: null,
  });
  const [target, setTarget] = useState<VerseSelection>({
    book_slug: "matthew",
    chapter: 1,
    verse_number: null,
  });
  const [relation, setRelation] = useState("cross_reference");
  const [weight, setWeight] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      request<{ id: number }>("/api/admin/discovery/cross-references", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "discovery-cross-refs"] });
    },
  });

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setSource({ book_slug: "matthew", chapter: 1, verse_number: null });
      setTarget({ book_slug: "matthew", chapter: 1, verse_number: null });
      setRelation("cross_reference");
      setWeight(1);
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (source.verse_number === null || target.verse_number === null) {
      setError("ሁለቱንም ጥቅሶች ይምረጡ");
      return;
    }
    try {
      await mutation.mutateAsync({
        source_verse_id: source.verse_number,
        target_verse_id: target.verse_number,
        relation,
        weight,
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="አዲስ የጥቅስ ግንኙነት"
      size="lg"
    >
      <div className="space-y-4">
        <VerseSelector
          label="ከ (ምንጭ ጥቅስ)"
          value={source}
          onChange={setSource}
        />
        <VerseSelector
          label="ወደ (መድረሻ ጥቅስ)"
          value={target}
          onChange={setTarget}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ዓይነት
            </label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className={inputClass}
            >
              <option value="cross_reference">ተዛማጅ</option>
              <option value="parallel">ትይዩ</option>
              <option value="quotation">ጥቅስ</option>
              <option value="allusion">ፍንጭ</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ክብደት (1-10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function VerseSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: VerseSelection;
  onChange: (v: VerseSelection) => void;
}) {
  const books = useBooks("NT");
  const chapterData = useChapter(value.book_slug, value.chapter, "AMH1954");
  const verses = chapterData.data?.verses ?? [];
  const selectedVerse = verses.find((v) => v.id === value.verse_number);

  return (
    <div className="space-y-3 rounded-lg border border-surface-border bg-surface-raised/10 p-3">
      <p className="font-amharic text-[13px] font-medium text-text-secondary">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <select
          value={value.book_slug}
          onChange={(e) =>
            onChange({
              ...value,
              book_slug: e.target.value,
              chapter: 1,
              verse_number: null,
            })
          }
          className={inputClass}
        >
          {books.data?.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name_am}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={value.chapter}
          onChange={(e) =>
            onChange({
              ...value,
              chapter: Math.max(1, Number(e.target.value)),
              verse_number: null,
            })
          }
          className={inputClass}
          placeholder="ምዕራፍ"
        />
        <div className="flex items-center justify-end text-[12px] text-text-faint">
          {verses.length > 0 ? `${verses.length} ጥቅሶች` : "..."}
        </div>
      </div>

      {chapterData.isLoading ? (
        <Skeleton className="h-14 w-full rounded-md" />
      ) : verses.length === 0 ? (
        <p className="py-2 text-center font-amharic text-[12px] text-text-faint">
          በዚህ ምዕራፍ ጥቅሶች አልተገኙም።
        </p>
      ) : (
        <div className="max-h-40 overflow-y-auto rounded-md border border-surface-border/60">
          {verses.map((v) => {
            const active = v.id === value.verse_number;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onChange({ ...value, verse_number: v.id })}
                className={cn(
                  "flex w-full items-start gap-2 px-2.5 py-1.5 text-left transition-colors",
                  active ? "bg-gold-500/10" : "hover:bg-surface-raised/40",
                )}
              >
                <span className="mt-0.5 min-w-[1.5rem] text-right text-[11px] tabular-nums text-text-faint">
                  {v.verse_number_ethiopic ?? v.verse_number}
                </span>
                <span className="line-clamp-1 flex-1 font-amharic text-[13px] leading-[1.7] text-text-secondary">
                  {v.text_am}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedVerse && (
        <p className="font-amharic text-[12px] text-gold-500/80">
          ተመርጧል:{" "}
          {selectedVerse.verse_number_ethiopic ?? selectedVerse.verse_number}
        </p>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
