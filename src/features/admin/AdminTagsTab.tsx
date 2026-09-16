import { useState } from "react";
import { Plus } from "lucide-react";
import { useTags, type TagOut } from "@/api/queries/discovery";
import { useCreateTag, useDeleteTag } from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-stone-950/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-stone-950/60 focus:outline-none",
);

export function AdminTagsTab() {
  const [page] = useState(1);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError } = useTags({ page, perPage: 200 });
  const deleteMutation = useDeleteTag();

  const tags = Array.isArray(data?.data) ? data!.data : [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-amharic text-[13px] text-text-muted">
          መለያዎች ጥቅሶችን ለማሰባሰብ ያገለግላሉ።{" "}
          <span className="text-text-faint">
            ማስተካከል ካስፈለገ መለያውን ሰርዘው በአዲስ ይተኩት።
          </span>
        </p>
        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ መለያ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="መለያዎችን መጫን አልተቻለም።" />
      ) : tags.length === 0 ? (
        <EmptyState
          titleAm="መለያ የለም"
          hintAm="የመጀመሪያውን መለያ ይፍጠሩ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ መለያ
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-surface-raised/20 text-left">
                <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                  ስም
                </th>
                <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                  Slug
                </th>
                <th className="w-[100px] px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {tags.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-surface-raised/10"
                >
                  <td className="px-4 py-3">
                    <p className="font-amharic text-[15px] text-text-primary">
                      {t.name_am}
                    </p>
                    {t.name_en && (
                      <p className="mt-0.5 text-[12px] text-text-muted">
                        {t.name_en}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <code className="rounded bg-surface-raised px-1.5 py-0.5 text-[12px] text-text-muted">
                      {t.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmButton
                      onConfirm={() => deleteMutation.mutate(t.id)}
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
      )}

      <TagCreateModal open={creating} onOpenChange={setCreating} />
    </>
  );
}

function TagCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createMutation = useCreateTag();
  const [slug, setSlug] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setSlug("");
      setNameAm("");
      setNameEn("");
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (!slug.trim() || !nameAm.trim()) {
      setError("Slug እና የአማርኛ ስም ያስፈልጋሉ");
      return;
    }
    try {
      await createMutation.mutateAsync({
        slug: slug.trim(),
        name_am: nameAm.trim(),
        name_en: nameEn.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.messageAm || err.message_en);
      } else {
        setError("ስህተት ተፈጥሯል");
      }
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange} title="አዲስ መለያ">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="genealogy"
            className={inputClass}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የአማርኛ ስም
          </label>
          <input
            type="text"
            value={nameAm}
            onChange={(e) => setNameAm(e.target.value)}
            placeholder="የትውልድ ሐረግ"
            className={inputClass}
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
            placeholder="Genealogy"
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
          <Button onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
