import { useState } from "react";
import { Plus, Pencil, Sparkles, Search } from "lucide-react";
import { useAllSaints, type SaintOut } from "@/api/queries/liturgy";
import {
  useCreateSaint,
  useDeleteSaint,
  useUpdateSaint,
} from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ApiRequestError } from "@/api/client";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { ETHIOPIAN_MONTHS } from "@/lib/ethiopic-months";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

export function AdminSaintsTab() {
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState<number | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SaintOut | null>(null);

  const { data, isLoading, isError, isFetching } = useAllSaints({
    page,
    perPage: 50,
    month: monthFilter,
  });

  const saints = Array.isArray(data?.data) ? data!.data : [];
  const meta = data?.meta;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            <select
              value={monthFilter ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setMonthFilter(v === "" ? undefined : Number(v));
                setPage(1);
              }}
              className={cn(
                inputClass,
                "cursor-pointer appearance-none pl-10 pr-8",
              )}
            >
              <option value="">ሁሉም ወራት</option>
              {ETHIOPIAN_MONTHS.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          {meta && (
            <span className="text-[12px] tabular-nums text-text-faint">
              {toEthiopicNumeral(meta.total)} ቅዱሳን
            </span>
          )}
        </div>
        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ ቅዱስ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ቅዱሳንን መጫን አልተቻለም።" />
      ) : saints.length === 0 ? (
        <EmptyState
          titleAm={monthFilter ? "በዚህ ወር ቅዱስ የለም" : "ቅዱስ የለም"}
          hintAm="አዲስ ቅዱስ መፍጠር ይችላሉ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ቅዱስ
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
                    የሚታወስበት ቀን
                  </th>
                  <th className="w-[180px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {saints.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-amharic text-[15px] text-text-primary">
                          {s.name_am}
                        </p>
                        {s.is_feast && (
                          <span className="inline-flex items-center gap-0.5 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                            <Sparkles className="h-2.5 w-2.5" />
                            በዓል
                          </span>
                        )}
                      </div>
                      {s.title_am && (
                        <p className="mt-0.5 font-amharic text-[12px] text-text-muted">
                          {s.title_am}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <p className="font-amharic text-[13px] text-text-muted">
                        {ETHIOPIAN_MONTHS[s.ethiopian_month - 1]}{" "}
                        {toEthiopicNumeral(s.ethiopian_day)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(s)}
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                          aria-label="አርትዕ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <DeleteSaintButton saintId={s.id} />
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

      <SaintEditorModal
        open={creating}
        onOpenChange={setCreating}
        mode="create"
      />
      <SaintEditorModal
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        saint={editing}
      />
    </>
  );
}

function DeleteSaintButton({ saintId }: { saintId: number }) {
  const deleteMutation = useDeleteSaint();
  return (
    <ConfirmButton
      onConfirm={() => deleteMutation.mutate(saintId)}
      busy={deleteMutation.isPending}
    >
      ሰርዝ
    </ConfirmButton>
  );
}

function SaintEditorModal({
  open,
  onOpenChange,
  mode,
  saint,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  saint?: SaintOut | null;
}) {
  const isEdit = mode === "edit";
  const createMutation = useCreateSaint();
  const updateMutation = useUpdateSaint(saint?.id ?? null);

  const [slug, setSlug] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [titleAm, setTitleAm] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [longBio, setLongBio] = useState("");
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [isFeast, setIsFeast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setSlug(saint?.slug ?? "");
      setNameAm(saint?.name_am ?? "");
      setNameEn(saint?.name_en ?? "");
      setTitleAm(saint?.title_am ?? "");
      setShortBio(saint?.short_bio_am ?? "");
      setLongBio(saint?.long_bio_am ?? "");
      setMonth(saint?.ethiopian_month ?? 1);
      setDay(saint?.ethiopian_day ?? 1);
      setIsFeast(saint?.is_feast ?? false);
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (!nameAm.trim()) {
      setError("የአማርኛ ስም ያስፈልጋል");
      return;
    }
    try {
      if (isEdit && saint) {
        await updateMutation.mutateAsync({
          name_am: nameAm.trim(),
          name_en: nameEn.trim() || null,
          title_am: titleAm.trim() || null,
          short_bio_am: shortBio.trim() || null,
          long_bio_am: longBio.trim() || null,
          is_feast: isFeast,
        });
      } else {
        if (!slug.trim()) {
          setError("Slug ያስፈልጋል");
          return;
        }
        await createMutation.mutateAsync({
          slug: slug.trim(),
          name_am: nameAm.trim(),
          name_en: nameEn.trim() || null,
          title_am: titleAm.trim() || null,
          short_bio_am: shortBio.trim() || null,
          long_bio_am: longBio.trim() || null,
          ethiopian_month: month,
          ethiopian_day: day,
          is_feast: isFeast,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "ቅዱስ አርትዕ" : "አዲስ ቅዱስ"}
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
              placeholder="st-john-chrysostom"
              className={inputClass}
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              የአማርኛ ስም
            </label>
            <input
              type="text"
              value={nameAm}
              onChange={(e) => setNameAm(e.target.value)}
              placeholder="ቅዱስ ዮሐንስ አፈወርቅ"
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
              placeholder="St. John Chrysostom"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ማዕረግ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            value={titleAm}
            onChange={(e) => setTitleAm(e.target.value)}
            placeholder="ሊቀ ጳጳሳት ዘቁስጥንጥንያ"
            className={inputClass}
          />
        </div>
        {!isEdit && (
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
                {ETHIOPIAN_MONTHS.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
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
        )}
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            አጭር የሕይወት ታሪክ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <textarea
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value)}
            rows={2}
            className={cn(inputClass, "resize-none")}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ሙሉ የሕይወት ታሪክ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <textarea
            value={longBio}
            onChange={(e) => setLongBio(e.target.value)}
            rows={6}
            className={cn(inputClass, "resize-none")}
          />
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isFeast}
            onChange={(e) => setIsFeast(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          <span className="font-amharic text-[14px] text-text-secondary">
            በዓል ነው (ጾምን ያቋርጣል)
          </span>
        </label>
        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "በማስቀመጥ ላይ..." : isEdit ? "አዘምን" : "አስቀምጥ"}
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
