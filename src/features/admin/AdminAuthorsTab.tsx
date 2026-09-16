import { useState } from "react";
import { Plus, Pencil, Sparkles, Search } from "lucide-react";
import { useAuthors, type AuthorOut } from "@/api/queries/authors";
import {
  useCreateAuthor,
  useDeleteAuthor,
  useUpdateAuthor,
} from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ApiRequestError } from "@/api/client";
import { eraLabel } from "@/lib/era";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-stone-950/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-stone-950/60 focus:outline-none",
);

const ERAS = ["Apostolic", "Ante-Nicene", "Nicene", "Post-Nicene"];

export function AdminAuthorsTab() {
  const [page, setPage] = useState(1);
  const [era, setEra] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AuthorOut | null>(null);

  const { data, isLoading, isError, isFetching } = useAuthors({
    page,
    perPage: 50,
    era,
  });

  const authors = Array.isArray(data?.data) ? data!.data : [];
  const meta = data?.meta;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEra(undefined);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
              !era
                ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
            )}
          >
            ሁሉም
          </button>
          {ERAS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setEra(e);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
                era === e
                  ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                  : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
              )}
            >
              {eraLabel(e) ?? e}
            </button>
          ))}
          {meta && (
            <span className="ml-2 text-[12px] tabular-nums text-text-faint">
              {meta.total} አበው
            </span>
          )}
        </div>

        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ ደራሲ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ደራሲያንን መጫን አልተቻለም።" />
      ) : authors.length === 0 ? (
        <EmptyState
          titleAm="ደራሲ የለም"
          hintAm="አዲስ ደራሲ መፍጠር ይችላሉ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ደራሲ
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
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    Era
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                    Slug
                  </th>
                  <th className="w-[160px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {authors.map((a) => (
                  <tr
                    key={a.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-amharic text-[15px] text-text-primary">
                          {a.name_am}
                        </p>
                        {a.ethiopian_venerated && (
                          <span className="inline-flex items-center gap-0.5 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                            <Sparkles className="h-2.5 w-2.5" />
                            ተከብሯል
                          </span>
                        )}
                      </div>
                      {a.name_en && (
                        <p className="mt-0.5 text-[12px] text-text-muted">
                          {a.name_en}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="font-amharic text-[13px] text-text-muted">
                        {eraLabel(a.era) ?? "—"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <code className="rounded bg-surface-raised px-1.5 py-0.5 text-[12px] text-text-muted">
                        {a.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(a)}
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                          aria-label="አርትዕ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <DeleteAuthorButton authorId={a.id} />
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

      <AuthorEditorModal
        open={creating}
        onOpenChange={setCreating}
        mode="create"
      />
      <AuthorEditorModal
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        author={editing}
      />
    </>
  );
}

function DeleteAuthorButton({ authorId }: { authorId: number }) {
  const deleteMutation = useDeleteAuthor();
  const [force, setForce] = useState(false);

  return (
    <ConfirmButton
      onConfirm={async () => {
        try {
          await deleteMutation.mutateAsync({ authorId });
        } catch (err) {
          if (err instanceof ApiRequestError && err.status === 409) {
            setForce(true);
            // Second click with force
            await deleteMutation.mutateAsync({ authorId, force: true });
          }
        }
      }}
      busy={deleteMutation.isPending}
    >
      {force ? "በኃይል ሰርዝ" : "ሰርዝ"}
    </ConfirmButton>
  );
}

function AuthorEditorModal({
  open,
  onOpenChange,
  mode,
  author,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  author?: AuthorOut | null;
}) {
  const isEdit = mode === "edit";
  const createMutation = useCreateAuthor();
  const updateMutation = useUpdateAuthor(author?.id ?? null);

  const [slug, setSlug] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [era, setEra] = useState("");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [deathYear, setDeathYear] = useState<number | "">("");
  const [bioAm, setBioAm] = useState("");
  const [ethiopianVenerated, setEthiopianVenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setSlug(author?.slug ?? "");
      setNameAm(author?.name_am ?? "");
      setNameEn(author?.name_en ?? "");
      setEra(author?.era ?? "");
      setBirthYear(author?.birth_year ?? "");
      setDeathYear(author?.death_year ?? "");
      setBioAm(author?.bio_am ?? "");
      setEthiopianVenerated(author?.ethiopian_venerated ?? false);
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
    const payload = {
      name_am: nameAm.trim(),
      name_en: nameEn.trim() || null,
      era: era || null,
      birth_year: birthYear === "" ? null : Number(birthYear),
      death_year: deathYear === "" ? null : Number(deathYear),
      bio_am: bioAm.trim() || null,
      ethiopian_venerated: ethiopianVenerated,
    };
    try {
      if (isEdit && author) {
        await updateMutation.mutateAsync(payload);
      } else {
        if (!slug.trim()) {
          setError("Slug ያስፈልጋል");
          return;
        }
        await createMutation.mutateAsync({ slug: slug.trim(), ...payload });
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
      title={isEdit ? "ደራሲ አርትዕ" : "አዲስ ደራሲ"}
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
              placeholder="john-chrysostom"
              className={inputClass}
              autoFocus
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              Era
            </label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {ERAS.map((e) => (
                <option key={e} value={e}>
                  {eraLabel(e)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              Birth year
            </label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) =>
                setBirthYear(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              Death year
            </label>
            <input
              type="number"
              value={deathYear}
              onChange={(e) =>
                setDeathYear(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የሕይወት ታሪክ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <textarea
            value={bioAm}
            onChange={(e) => setBioAm(e.target.value)}
            rows={6}
            className={cn(inputClass, "resize-none")}
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={ethiopianVenerated}
            onChange={(e) => setEthiopianVenerated(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          <span className="font-amharic text-[14px] text-text-secondary">
            በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ዘንድ የተከበረ
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
