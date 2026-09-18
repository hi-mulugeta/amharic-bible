import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request, ApiRequestError } from "@/api/client";
import { useAdminVotd } from "@/api/queries/admin";
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

export function AdminVotdTab() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isError, isFetching } = useAdminVotd({ page });
  const items = data?.data ?? [];
  const meta = data?.meta;
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      request<void>(`/api/admin/liturgy/verse-of-day/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-votd"] });
    },
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-amharic text-[13px] text-text-muted">
          ለዕለቱ የሚመረጡ ጥቅሶች።
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          አዲስ ጥቅስ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ጥቅሶችን መጫን አልተቻለም።" />
      ) : items.length === 0 ? (
        <EmptyState
          titleAm="የዕለቱ ጥቅስ የለም"
          hintAm="ለአንድ ቀን የዕለቱን ጥቅስ ይምረጡ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ጥቅስ
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
                    ጥቅስ
                  </th>
                  <th className="w-[100px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((v) => (
                  <tr
                    key={v.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      <p className="font-amharic text-[13px] tabular-nums text-text-muted">
                        {v.gregorian_date}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {v.book_slug &&
                        v.chapter !== null &&
                        v.verse_number !== null && (
                          <p className="font-amharic text-[12px] text-gold-500/80">
                            {v.book_name_am} {toEthiopicNumeral(v.chapter)}:
                            {toEthiopicNumeral(v.verse_number)}
                          </p>
                        )}
                      {v.text_am && (
                        <p className="mt-1 line-clamp-2 font-amharic text-[14px] leading-[1.8] text-text-primary">
                          {v.text_am}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmButton
                        onConfirm={() => deleteMutation.mutate(v.id)}
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

      <VotdCreateModal open={creating} onOpenChange={setCreating} />
    </>
  );
}

function VotdCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bookSlug, setBookSlug] = useState("matthew");
  const [chapter, setChapter] = useState(1);
  const [verseNumber, setVerseNumber] = useState<number | null>(null);
  const [reflectionAm, setReflectionAm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const books = useBooks("NT");
  const chapterData = useChapter(bookSlug, chapter, "AMH1954");
  const verses = chapterData.data?.verses ?? [];

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      request<{ id: number }>("/api/admin/liturgy/verse-of-day", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "liturgy-votd"] });
    },
  });

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setDate(new Date().toISOString().slice(0, 10));
      setBookSlug("matthew");
      setChapter(1);
      setVerseNumber(null);
      setReflectionAm("");
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (verseNumber === null) {
      setError("ጥቅስ ይምረጡ");
      return;
    }
    try {
      await mutation.mutateAsync({
        gregorian_date: date,
        verse_id: verseNumber,
        reflection_am: reflectionAm.trim() || null,
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

  const selectedVerse = verses.find((v) => v.id === verseNumber);

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="አዲስ የዕለቱ ጥቅስ"
      size="lg"
    >
      <div className="space-y-4">
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
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              መጽሐፍ
            </label>
            <select
              value={bookSlug}
              onChange={(e) => {
                setBookSlug(e.target.value);
                setChapter(1);
                setVerseNumber(null);
              }}
              className={inputClass}
            >
              {books.data?.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name_am}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ምዕራፍ
            </label>
            <input
              type="number"
              min={1}
              value={chapter}
              onChange={(e) => {
                setChapter(Math.max(1, Number(e.target.value)));
                setVerseNumber(null);
              }}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ጥቅስ
          </label>
          {chapterData.isLoading ? (
            <Skeleton className="h-14 w-full rounded-lg" />
          ) : verses.length === 0 ? (
            <p className="py-3 font-amharic text-[13px] text-text-muted">
              በዚህ ምዕራፍ ጥቅሶች አልተገኙም።
            </p>
          ) : (
            <div className="max-h-52 overflow-y-auto rounded-lg border border-surface-border">
              {verses.map((v) => {
                const active = v.id === verseNumber;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVerseNumber(v.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-2 text-left transition-colors",
                      active ? "bg-gold-500/10" : "hover:bg-surface-raised/40",
                    )}
                  >
                    <span className="mt-0.5 min-w-[1.5rem] text-right text-[12px] tabular-nums text-text-faint">
                      {v.verse_number_ethiopic ?? v.verse_number}
                    </span>
                    <span className="flex-1 font-amharic text-[14px] leading-[1.8] text-text-secondary">
                      {v.text_am}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {selectedVerse && (
          <div className="rounded-lg border border-gold-500/30 bg-gold-500/[0.05] p-3">
            <p className="mb-1 font-amharic text-[12px] text-gold-500/80">
              የተመረጠው ጥቅስ
            </p>
            <p className="font-amharic text-[14px] leading-[1.8] text-text-primary">
              {selectedVerse.text_am}
            </p>
          </div>
        )}
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ማሰላሰያ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <textarea
            value={reflectionAm}
            onChange={(e) => setReflectionAm(e.target.value)}
            rows={3}
            placeholder="የዕለቱ አስተንትኖ..."
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
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
