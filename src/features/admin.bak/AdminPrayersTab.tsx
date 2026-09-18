import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request, ApiRequestError } from "@/api/client";
import { useAdminPrayers, type AdminPrayer } from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { PRAYER_CATEGORIES } from "@/api/queries/liturgy";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

export function AdminPrayersTab() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminPrayer | null>(null);
  const { data, isLoading, isError, isFetching } = useAdminPrayers({ page });
  const items = data?.data ?? [];
  const meta = data?.meta;
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      request<void>(`/api/admin/liturgy/prayers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-prayers"] });
    },
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-amharic text-[13px] text-text-muted">
          የቤተ ክርስቲያን ጸሎቶች።
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          አዲስ ጸሎት
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ጸሎቶችን መጫን አልተቻለም።" />
      ) : items.length === 0 ? (
        <EmptyState
          titleAm="ጸሎት የለም"
          hintAm="የመጀመሪያውን ጸሎት ይፍጠሩ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ጸሎት
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
                    ርዕስ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                    ምድብ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ቃላት
                  </th>
                  <th className="w-[160px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      <p className="font-amharic text-[15px] text-text-primary">
                        {p.title_am}
                      </p>
                      {p.title_en && (
                        <p className="mt-0.5 text-[12px] text-text-muted">
                          {p.title_en}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="font-amharic text-[13px] text-text-muted">
                        {PRAYER_CATEGORIES.find((c) => c.key === p.category)
                          ?.label ??
                          p.category ??
                          "—"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-[12px] tabular-nums text-text-faint">
                        {p.word_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                          aria-label="አርትዕ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <ConfirmButton
                          onConfirm={() => deleteMutation.mutate(p.id)}
                          busy={deleteMutation.isPending}
                        >
                          ሰርዝ
                        </ConfirmButton>
                      </div>
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

      <PrayerEditorModal
        open={creating || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        prayer={editing}
      />
    </>
  );
}

function PrayerEditorModal({
  open,
  onOpenChange,
  prayer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prayer: AdminPrayer | null;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(prayer);
  const [slug, setSlug] = useState("");
  const [titleAm, setTitleAm] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [category, setCategory] = useState("");
  const [bodyAm, setBodyAm] = useState("");
  const [sourceAm, setSourceAm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (isEdit && prayer) {
        return request(`/api/admin/liturgy/prayers/${prayer.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return request("/api/admin/liturgy/prayers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-prayers"] });
    },
  });

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setSlug(prayer?.slug ?? "");
      setTitleAm(prayer?.title_am ?? "");
      setTitleEn(prayer?.title_en ?? "");
      setCategory(prayer?.category ?? "");
      setBodyAm("");
      setSourceAm(prayer?.source_am ?? "");
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (!titleAm.trim()) {
      setError("ርዕስ ያስፈልጋል");
      return;
    }
    if (!isEdit && !slug.trim()) {
      setError("Slug ያስፈልጋል");
      return;
    }
    if (!bodyAm.trim() && !isEdit) {
      setError("የጸሎቱ ይዘት ያስፈልጋል");
      return;
    }
    try {
      await mutation.mutateAsync({
        ...(isEdit ? {} : { slug: slug.trim() }),
        title_am: titleAm.trim(),
        title_en: titleEn.trim() || null,
        category: category || null,
        ...(bodyAm.trim() ? { body_am: bodyAm.trim() } : {}),
        source_am: sourceAm.trim() || null,
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
      title={isEdit ? "ጸሎት አርትዕ" : "አዲስ ጸሎት"}
      size="lg"
    >
      <div className="space-y-4">
        {!isEdit && (
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="morning-prayer"
              className={inputClass}
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ርዕስ
            </label>
            <input
              type="text"
              value={titleAm}
              onChange={(e) => setTitleAm(e.target.value)}
              placeholder="የንጋት ጸሎት"
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
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Morning Prayer"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ምድብ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {PRAYER_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የጸሎቱ ይዘት{" "}
            {isEdit && (
              <span className="text-text-faint">(ባዶ ካስቀመጡ አይለወጥም)</span>
            )}
          </label>
          <textarea
            value={bodyAm}
            onChange={(e) => setBodyAm(e.target.value)}
            rows={8}
            placeholder="በስመ አብ ወወልድ ወመንፈስ ቅዱስ..."
            className={cn(inputClass, "resize-none")}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ምንጭ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            value={sourceAm}
            onChange={(e) => setSourceAm(e.target.value)}
            placeholder="የቅዱስ ዮሐንስ አፈወርቅ ጸሎት"
            className={inputClass}
          />
        </div>
        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? "በማስቀመጥ ላይ..." : isEdit ? "አዘምን" : "አስቀምጥ"}
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
