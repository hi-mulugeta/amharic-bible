import { useState } from "react";
import { Plus, Pencil, Sparkles } from "lucide-react";
import { useBooks, type BookOut } from "@/api/queries/bible";
import {
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  type BookCreate,
} from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

export function AdminBooksTab() {
  const [testament, setTestament] = useState<"OT" | "NT" | undefined>(
    undefined,
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BookOut | null>(null);

  const { data: books, isLoading, isError, isFetching } = useBooks(testament);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTestament(undefined)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
              !testament
                ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
            )}
          >
            ሁሉም
          </button>
          <button
            type="button"
            onClick={() => setTestament("OT")}
            className={cn(
              "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
              testament === "OT"
                ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
            )}
          >
            ብሉይ
          </button>
          <button
            type="button"
            onClick={() => setTestament("NT")}
            className={cn(
              "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
              testament === "NT"
                ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
            )}
          >
            አዲስ
          </button>
          {books && (
            <span className="ml-2 text-[12px] tabular-nums text-text-faint">
              {books.length} መጻሕፍት
            </span>
          )}
        </div>
        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ መጽሐፍ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="መጻሕፍትን መጫን አልተቻለም።" />
      ) : !books || books.length === 0 ? (
        <EmptyState
          titleAm="መጽሐፍ የለም"
          hintAm="የመጀመሪያውን መጽሐፍ ይፍጠሩ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ መጽሐፍ
            </Button>
          }
        />
      ) : (
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-surface-border transition-opacity",
            isFetching ? "opacity-60" : "opacity-100",
          )}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-surface-raised/20 text-left">
                <th className="w-12 px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                  #
                </th>
                <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                  ስም
                </th>
                <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                  Slug
                </th>
                <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                  ምዕራፎች
                </th>
                <th className="w-[140px] px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {books.map((b) => (
                <tr
                  key={b.id}
                  className="transition-colors hover:bg-surface-raised/10"
                >
                  <td className="px-4 py-3">
                    <span className="text-[12px] tabular-nums text-text-faint">
                      {b.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-amharic text-[15px] text-text-primary">
                        {b.name_am}
                      </p>
                      {b.is_deuterocanonical && (
                        <span className="inline-flex items-center gap-0.5 rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-400">
                          ዲዩትሮ
                        </span>
                      )}
                      {b.ethiopian_only && (
                        <span className="inline-flex items-center gap-0.5 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold-400">
                          <Sparkles className="h-2.5 w-2.5" />
                          ኢትዮጵያ
                        </span>
                      )}
                    </div>
                    {b.name_en && (
                      <p className="mt-0.5 text-[12px] text-text-muted">
                        {b.name_en}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <code className="rounded bg-surface-raised px-1.5 py-0.5 text-[12px] text-text-muted">
                      {b.slug}
                    </code>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-[13px] tabular-nums text-text-muted">
                      {b.total_chapters}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(b)}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                        aria-label="አርትዕ"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <DeleteBookButton bookId={b.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BookEditorModal
        open={creating}
        onOpenChange={setCreating}
        mode="create"
      />
      <BookEditorModal
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        book={editing}
      />
    </>
  );
}

function DeleteBookButton({ bookId }: { bookId: number }) {
  const deleteMutation = useDeleteBook();
  const [force, setForce] = useState(false);

  return (
    <ConfirmButton
      onConfirm={async () => {
        try {
          await deleteMutation.mutateAsync({ bookId });
        } catch (err) {
          if (err instanceof ApiRequestError && err.status === 409) {
            setForce(true);
            await deleteMutation.mutateAsync({ bookId, force: true });
          }
        }
      }}
      busy={deleteMutation.isPending}
    >
      {force ? "በኃይል ሰርዝ" : "ሰርዝ"}
    </ConfirmButton>
  );
}

function BookEditorModal({
  open,
  onOpenChange,
  mode,
  book,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  book?: BookOut | null;
}) {
  const isEdit = mode === "edit";
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook(book?.id ?? null);

  const [slug, setSlug] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [nameAmFull, setNameAmFull] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [abbreviationAm, setAbbreviationAm] = useState("");
  const [testament, setTestament] = useState<"OT" | "NT">("NT");
  const [position, setPosition] = useState(1);
  const [totalChapters, setTotalChapters] = useState(1);
  const [isDeutero, setIsDeutero] = useState(false);
  const [ethiopianOnly, setEthiopianOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setSlug(book?.slug ?? "");
      setNameAm(book?.name_am ?? "");
      setNameAmFull(book?.name_am_full ?? "");
      setNameEn(book?.name_en ?? "");
      setAbbreviationAm(book?.abbreviation_am ?? "");
      setTestament(book?.testament ?? "NT");
      setPosition(book?.position ?? 1);
      setTotalChapters(book?.total_chapters ?? 1);
      setIsDeutero(book?.is_deuterocanonical ?? false);
      setEthiopianOnly(book?.ethiopian_only ?? false);
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
    if (!nameEn.trim()) {
      setError("English name is required");
      return;
    }
    if (!isEdit && !slug.trim()) {
      setError("Slug ያስፈልጋል");
      return;
    }

    const payload: BookCreate = {
      slug: slug.trim(),
      name_am: nameAm.trim(),
      name_am_full: nameAmFull.trim() || null,
      name_en: nameEn.trim(),
      abbreviation_am: abbreviationAm.trim() || null,
      testament,
      position,
      total_chapters: totalChapters,
      is_deuterocanonical: isDeutero,
      ethiopian_only: ethiopianOnly,
    };

    try {
      if (isEdit && book) {
        const { slug: _slug, ...updatePayload } = payload;
        await updateMutation.mutateAsync(updatePayload);
      } else {
        await createMutation.mutateAsync(payload);
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
      title={isEdit ? "መጽሐፍ አርትዕ" : "አዲስ መጽሐፍ"}
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
              placeholder="matthew"
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
              placeholder="ማቴዎስ"
              className={inputClass}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              English name
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Matthew"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ሙሉ የአማርኛ ስም <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            value={nameAmFull}
            onChange={(e) => setNameAmFull(e.target.value)}
            placeholder="መጽሐፈ ማቴዎስ"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            አሕጽሮተ ስም <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            value={abbreviationAm}
            onChange={(e) => setAbbreviationAm(e.target.value)}
            placeholder="ማቴ"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ኪዳን
            </label>
            <select
              value={testament}
              onChange={(e) => setTestament(e.target.value as "OT" | "NT")}
              className={inputClass}
            >
              <option value="OT">ብሉይ</option>
              <option value="NT">አዲስ</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ቅደም ተከተል
            </label>
            <input
              type="number"
              min={1}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ምዕራፎች
            </label>
            <input
              type="number"
              min={1}
              value={totalChapters}
              onChange={(e) => setTotalChapters(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isDeutero}
              onChange={(e) => setIsDeutero(e.target.checked)}
              className="h-4 w-4 accent-gold-500"
            />
            <span className="font-amharic text-[14px] text-text-secondary">
              ዲዩትሮካኖኒካል ነው
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={ethiopianOnly}
              onChange={(e) => setEthiopianOnly(e.target.checked)}
              className="h-4 w-4 accent-gold-500"
            />
            <span className="font-amharic text-[14px] text-text-secondary">
              በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ብቻ
            </span>
          </label>
        </div>

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
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
