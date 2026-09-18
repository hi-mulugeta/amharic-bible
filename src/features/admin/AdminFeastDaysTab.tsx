import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request, ApiRequestError } from "@/api/client";
import { useAdminFeastDays } from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ETHIOPIAN_MONTHS } from "@/lib/ethiopic-months";
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
  { key: "feast", label: "በዓል" },
  { key: "fast_start", label: "የጾም መጀመሪያ" },
  { key: "fast_end", label: "የጾም ማብቂያ" },
  { key: "holy_day", label: "የተከበረ ቀን" },
] as const;

export function AdminFeastDaysTab() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isError, isFetching } = useAdminFeastDays({ page });
  const items = data?.data ?? [];
  const meta = data?.meta;
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      request<void>(`/api/admin/liturgy/feast-days/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-feast-days"] });
    },
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-amharic text-[13px] text-text-muted">
          በዓላትና የጾም ማብቂያ ቀናት።
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          አዲስ በዓል
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="በዓላትን መጫን አልተቻለም።" />
      ) : items.length === 0 ? (
        <EmptyState
          titleAm="በዓል የለም"
          hintAm="የመጀመሪያውን በዓል ይፍጠሩ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ በዓል
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
                    ስም
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                    ቀን
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ዓይነት
                  </th>
                  <th className="w-[100px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((f) => (
                  <tr
                    key={f.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-amharic text-[15px] text-text-primary">
                          {f.name_am}
                        </p>
                        {f.breaks_fast && (
                          <span className="inline-flex items-center gap-0.5 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                            <Sparkles className="h-2.5 w-2.5" />
                            ጾም ያቋርጣል
                          </span>
                        )}
                      </div>
                      {f.name_en && (
                        <p className="mt-0.5 text-[12px] text-text-muted">
                          {f.name_en}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <p className="font-amharic text-[13px] text-text-muted">
                        {f.ethiopian_month_name}{" "}
                        {toEthiopicNumeral(f.ethiopian_day)}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <code className="rounded bg-surface-raised px-1.5 py-0.5 text-[12px] text-text-muted">
                        {f.kind}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmButton
                        onConfirm={() => deleteMutation.mutate(f.id)}
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

      <FeastCreateModal open={creating} onOpenChange={setCreating} />
    </>
  );
}

function FeastCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [kind, setKind] = useState<string>("feast");
  const [nameAm, setNameAm] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAm, setDescAm] = useState("");
  const [breaksFast, setBreaksFast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      request<{ id: number }>("/api/admin/liturgy/feast-days", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-feast-days"] });
    },
  });

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setMonth(1);
      setDay(1);
      setKind("feast");
      setNameAm("");
      setNameEn("");
      setDescAm("");
      setBreaksFast(false);
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (!nameAm.trim()) {
      setError("ስም ያስፈልጋል");
      return;
    }
    try {
      await mutation.mutateAsync({
        ethiopian_month: month,
        ethiopian_day: day,
        kind,
        name_am: nameAm.trim(),
        name_en: nameEn.trim() || null,
        description_am: descAm.trim() || null,
        breaks_fast: breaksFast,
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
      title="አዲስ በዓል"
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ወር
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={inputClass}
            >
              {ETHIOPIAN_MONTHS.map((n, i) => (
                <option key={i} value={i + 1}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ቀን
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ዓይነት
          </label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={inputClass}
          >
            {KINDS.map((k) => (
              <option key={k.key} value={k.key}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የአማርኛ ስም
          </label>
          <input
            type="text"
            value={nameAm}
            onChange={(e) => setNameAm(e.target.value)}
            placeholder="ገና"
            className={inputClass}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            English <span className="text-text-faint">(optional)</span>
          </label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Christmas"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            መግለጫ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <textarea
            value={descAm}
            onChange={(e) => setDescAm(e.target.value)}
            rows={3}
            className={cn(inputClass, "resize-none")}
          />
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={breaksFast}
            onChange={(e) => setBreaksFast(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          <span className="font-amharic text-[14px] text-text-secondary">
            ጾምን ያቋርጣል
          </span>
        </label>
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

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
