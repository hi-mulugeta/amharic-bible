import { useState } from "react";
import { Plus, Pencil, Search } from "lucide-react";
import { useTopics, type TopicOut } from "@/api/queries/discovery";
import {
  useCreateTopic,
  useDeleteTopic,
  useUpdateTopic,
  type TopicCreate,
} from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerseAttacher } from "./VerseAttacher";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-stone-950/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-stone-950/60 focus:outline-none",
);

export function AdminTopicsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TopicOut | null>(null);
  const [creating, setCreating] = useState(false);
  const [attachingTo, setAttachingTo] = useState<TopicOut | null>(null);

  const { data, isLoading, isError } = useTopics({
    page,
    q: search,
    perPage: 50,
  });
  const deleteMutation = useDeleteTopic();

  const topics = Array.isArray(data?.data) ? data!.data : [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ርዕስ ፈልግ..."
            className={cn(inputClass, "pl-10")}
          />
        </div>
        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ ርዕስ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ርዕሶችን መጫን አልተቻለም።" />
      ) : topics.length === 0 ? (
        <EmptyState
          titleAm={search ? "ውጤት አልተገኘም" : "ርዕስ የለም"}
          hintAm={search ? "ሌላ ቃል ይሞክሩ።" : "የመጀመሪያውን ርዕስ ይፍጠሩ።"}
          action={
            !search ? (
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" />
                አዲስ ርዕስ
              </Button>
            ) : undefined
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
                <th className="w-[180px] px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {topics.map((t) => (
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setAttachingTo(t)}
                        className="rounded-md px-2.5 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                      >
                        ጥቅሶች
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(t)}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                        aria-label="አርትዕ"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <ConfirmButton
                        onConfirm={() => deleteMutation.mutate(t.id)}
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
      )}

      {/* Create */}
      <TopicEditorModal
        open={creating}
        onOpenChange={setCreating}
        mode="create"
      />

      {/* Edit */}
      <TopicEditorModal
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        topic={editing}
      />

      {/* Attach verses */}
      <VerseAttacher
        open={Boolean(attachingTo)}
        onOpenChange={(o) => !o && setAttachingTo(null)}
        topic={attachingTo}
      />
    </>
  );
}

// ------------------------------------------------------------
// Topic editor — shared between create and edit
// ------------------------------------------------------------

function TopicEditorModal({
  open,
  onOpenChange,
  mode,
  topic,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  topic?: TopicOut | null;
}) {
  const isEdit = mode === "edit";
  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic(topic?.id ?? null);

  const [slug, setSlug] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAm, setDescAm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset form when the modal opens
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setSlug(topic?.slug ?? "");
      setNameAm(topic?.name_am ?? "");
      setNameEn(topic?.name_en ?? "");
      setDescAm(topic?.description_am ?? "");
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
      if (isEdit && topic) {
        await updateMutation.mutateAsync({
          name_am: nameAm.trim(),
          name_en: nameEn.trim() || null,
          description_am: descAm.trim() || null,
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
          description_am: descAm.trim() || null,
        });
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.messageAm || err.message_en);
      } else {
        setError("ስህተት ተፈጥሯል");
      }
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "ርዕስ አርትዕ" : "አዲስ ርዕስ"}
    >
      <div className="space-y-4">
        {!isEdit && (
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              Slug <span className="text-text-faint">(URL ለመስራት የሚያገለግል)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="incarnation"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የአማርኛ ስም
          </label>
          <input
            type="text"
            value={nameAm}
            onChange={(e) => setNameAm(e.target.value)}
            placeholder="ሥጋ መልበስ"
            className={inputClass}
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            English name <span className="text-text-faint">(optional)</span>
          </label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Incarnation"
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

        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
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
