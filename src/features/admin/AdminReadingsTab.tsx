import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request, ApiRequestError } from "@/api/client";
import { useAdminReadings } from "@/api/queries/admin";
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

const KINDS = [
  { key: "gospel", label: "ወንጌል" },
  { key: "epistle", label: "መልእክት" },
  { key: "psalm", label: "መዝሙር" },
  { key: "ot", label: "ብሉይ" },
  { key: "torah", label: "ኦሪት" },
] as const;

export function AdminReadingsTab() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isError, isFetching } = useAdminReadings({ page });
  const items = data?.data ?? [];
  const meta = data?.meta;
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      request<void>(`/api/admin/liturgy/readings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-readings"] });
    },
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-amharic text-[13px] text-text-muted">
          ለዕለቱ የሚነበቡ ምንባቦች።{" "}
          <span className="text-text-faint">ማስተካከል ካስፈለገ ሰርዘው በአዲስ ይተኩት።</span>
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          አዲስ ምንባብ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ምንባቦችን መጫን አልተቻለም።" />
      ) : items.length === 0 ? (
        <EmptyState
          titleAm="ምንባብ የለም"
          hintAm="ለአንድ ቀን ምንባቦችን ይምረጡ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ምንባብ
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
                    ቀን
                  </th>
                  <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                    ርዕስ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ብዛት
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
                      <p className="font-amharic text-[13px] tabular-nums text-text-muted">
                        {r.gregorian_date}
                      </p>
                      <p className="mt-0.5 font-amharic text-[11px] text-text-faint">
                        {r.ethiopian_month_name}{" "}
                        {toEthiopicNumeral(r.ethiopian_day)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-amharic text-[14px] text-text-primary">
                        {r.title_am ?? "—"}
                      </p>
                      {r.description_am && (
                        <p className="mt-0.5 font-amharic text-[12px] text-text-muted line-clamp-1">
                          {r.description_am}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-[12px] tabular-nums text-text-faint">
                        {r.reading_count}
                      </span>
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

      <ReadingCreateModal open={creating} onOpenChange={setCreating} />
    </>
  );
}

type ReadingSpec = {
  kind: string;
  book_slug: string;
  chapter: number;
  start: number;
  end: number;
};

function ReadingCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [titleAm, setTitleAm] = useState("የዕለቱ ምንባቦች");
  const [descAm, setDescAm] = useState("");
  const [specs, setSpecs] = useState<ReadingSpec[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      request<{ id: number }>("/api/admin/liturgy/readings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-readings"] });
    },
  });

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setDate(new Date().toISOString().slice(0, 10));
      setTitleAm("የዕለቱ ምንባቦች");
      setDescAm("");
      setSpecs([]);
      setError(null);
    }
    onOpenChange(o);
  };

  const addSpec = () => {
    setSpecs((s) => [
      ...s,
      { kind: "gospel", book_slug: "matthew", chapter: 1, start: 1, end: 1 },
    ]);
  };

  const updateSpec = (idx: number, patch: Partial<ReadingSpec>) => {
    setSpecs((s) => s.map((sp, i) => (i === idx ? { ...sp, ...patch } : sp)));
  };

  const removeSpec = (idx: number) => {
    setSpecs((s) => s.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    setError(null);
    if (specs.length === 0) {
      setError("ቢያንስ አንድ ምንባብ ይጨምሩ");
      return;
    }
    try {
      await mutation.mutateAsync({
        gregorian_date: date,
        title_am: titleAm.trim() || null,
        description_am: descAm.trim() || null,
        readings: specs,
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
      title="አዲስ ምንባብ"
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ቀን (ግሪጎሪያን)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ርዕስ
            </label>
            <input
              type="text"
              value={titleAm}
              onChange={(e) => setTitleAm(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            መግለጫ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            value={descAm}
            onChange={(e) => setDescAm(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="border-t border-surface-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-amharic text-[13px] font-medium text-text-secondary">
              ምንባቦች ({specs.length})
            </p>
            <button
              type="button"
              onClick={addSpec}
              className="inline-flex items-center gap-1 rounded-md bg-surface-raised px-3 py-1.5 font-amharic text-[12px] font-medium text-text-primary transition-colors hover:bg-surface-sunken"
            >
              <Plus className="h-3 w-3" />
              ምንባብ ጨምር
            </button>
          </div>

          {specs.length === 0 ? (
            <p className="py-6 text-center font-amharic text-[13px] text-text-muted">
              ምንባብ አልተጨመረም።
            </p>
          ) : (
            <div className="space-y-3">
              {specs.map((spec, i) => (
                <SpecEditor
                  key={i}
                  spec={spec}
                  onChange={(patch) => updateSpec(i, patch)}
                  onRemove={() => removeSpec(i)}
                />
              ))}
            </div>
          )}
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

function SpecEditor({
  spec,
  onChange,
  onRemove,
}: {
  spec: ReadingSpec;
  onChange: (patch: Partial<ReadingSpec>) => void;
  onRemove: () => void;
}) {
  const books = useBooks("NT");
  const chapterData = useChapter(spec.book_slug, spec.chapter, "AMH1954");
  const maxVerse = chapterData.data?.verses.length ?? 0;

  return (
    <div className="space-y-3 rounded-lg border border-surface-border bg-surface-raised/10 p-3">
      <div className="flex items-center gap-2">
        <select
          value={spec.kind}
          onChange={(e) => onChange({ kind: e.target.value })}
          className={cn(inputClass, "w-auto")}
        >
          {KINDS.map((k) => (
            <option key={k.key} value={k.key}>
              {k.label}
            </option>
          ))}
        </select>
        <select
          value={spec.book_slug}
          onChange={(e) =>
            onChange({
              book_slug: e.target.value,
              chapter: 1,
              start: 1,
              end: 1,
            })
          }
          className={cn(inputClass, "flex-1")}
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
          value={spec.chapter}
          onChange={(e) =>
            onChange({
              chapter: Math.max(1, Number(e.target.value)),
              start: 1,
              end: 1,
            })
          }
          className={cn(inputClass, "w-20")}
          placeholder="ምዕ"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-red-400"
          aria-label="አስወግድ"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-amharic text-[12px] text-text-faint">ጥቅስ</span>
        <input
          type="number"
          min={1}
          max={maxVerse || undefined}
          value={spec.start}
          onChange={(e) =>
            onChange({ start: Math.max(1, Number(e.target.value)) })
          }
          className={cn(inputClass, "w-20")}
        />
        <span className="font-amharic text-[12px] text-text-faint">እስከ</span>
        <input
          type="number"
          min={spec.start}
          max={maxVerse || undefined}
          value={spec.end}
          onChange={(e) =>
            onChange({ end: Math.max(spec.start, Number(e.target.value)) })
          }
          className={cn(inputClass, "w-20")}
        />
        {maxVerse > 0 && (
          <span className="font-amharic text-[11px] text-text-faint">
            (ከ {maxVerse} ጥቅሶች)
          </span>
        )}
      </div>
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
