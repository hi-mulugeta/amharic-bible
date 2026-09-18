import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";
import { useBooks, useChapter } from "@/api/queries/bible";
import { useAttachTagToVerse } from "@/api/queries/admin";
import type { TagOut } from "@/api/queries/discovery";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tag: TagOut | null;
};

function useTagVerses(tagSlug: string | null) {
  return useQuery({
    enabled: Boolean(tagSlug),
    queryKey: ["tags", tagSlug, "verses"],
    queryFn: () =>
      request<{
        data: Array<{ verse_id: number }>;
        meta: { total: number; page: number; per_page: number; pages: number };
      }>(`/api/tags/${tagSlug}/verses`, {
        query: { page: 1, per_page: 200 },
      }),
    staleTime: 30 * 1000,
  });
}

export function TagVerseAttacher({ open, onOpenChange, tag }: Props) {
  const [bookSlug, setBookSlug] = useState("matthew");
  const [chapter, setChapter] = useState(1);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const books = useBooks("NT");
  const chapterData = useChapter(
    open ? bookSlug : undefined,
    open ? chapter : undefined,
    "AMH1954",
  );
  const existing = useTagVerses(open ? (tag?.slug ?? null) : null);
  const attachMutation = useAttachTagToVerse();

  const existingVerseIds = useMemo(() => {
    const set = new Set<number>();
    for (const v of existing.data?.data ?? []) set.add(v.verse_id);
    return set;
  }, [existing.data]);

  const handleToggle = (verseId: number) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(verseId)) next.delete(verseId);
      else next.add(verseId);
      return next;
    });
  };

  const handleAttach = async () => {
    if (!tag || picked.size === 0) return;
    const verses = chapterData.data?.verses ?? [];
    const toAttach = verses.filter((v) => picked.has(v.id));
    for (const v of toAttach) {
      await attachMutation.mutateAsync({
        bookSlug,
        chapter,
        verseNumber: v.verse_number,
        tagSlugs: [tag.slug],
      });
    }
    setPicked(new Set());
    existing.refetch();
  };

  const handleClose = () => {
    setPicked(new Set());
    onOpenChange(false);
  };

  const verses = chapterData.data?.verses ?? [];

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={tag ? `${tag.name_am} — ጥቅሶች አያዝ` : "ጥቅሶች አያዝ"}
      size="lg"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-secondary">
              መጽሐፍ
            </label>
            <select
              value={bookSlug}
              onChange={(e) => {
                setBookSlug(e.target.value);
                setChapter(1);
              }}
              className="w-full rounded-lg border border-surface-border bg-surface-sunken/40 px-3 py-2 font-amharic text-[14px] text-text-primary focus:border-gold-500/40 focus:outline-none"
            >
              {books.data?.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name_am}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-secondary">
              ምዕራፍ
            </label>
            <input
              type="number"
              min={1}
              value={chapter}
              onChange={(e) => setChapter(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-surface-border bg-surface-sunken/40 px-3 py-2 font-amharic text-[14px] text-text-primary focus:border-gold-500/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-lg border border-surface-border">
          <div className="max-h-[320px] overflow-y-auto p-3">
            {chapterData.isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : chapterData.isError || !chapterData.data ? (
              <p className="py-8 text-center font-amharic text-[13px] text-text-muted">
                ምዕራፉን መጫን አልተቻለም
              </p>
            ) : verses.length === 0 ? (
              <p className="py-8 text-center font-amharic text-[13px] text-text-muted">
                ጥቅስ አልተገኘም
              </p>
            ) : (
              <div className="space-y-0.5">
                {verses.map((v) => {
                  const alreadyIn = existingVerseIds.has(v.id);
                  const isPicked = picked.has(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => !alreadyIn && handleToggle(v.id)}
                      disabled={alreadyIn}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors",
                        alreadyIn
                          ? "cursor-not-allowed opacity-50"
                          : isPicked
                            ? "bg-gold-500/10 ring-1 ring-gold-500/30"
                            : "hover:bg-surface-raised",
                      )}
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-surface-border">
                        {(isPicked || alreadyIn) && (
                          <Check className="h-3 w-3 text-gold-500" />
                        )}
                      </span>
                      <span className="min-w-[1.5rem] text-right text-[12px] tabular-nums text-text-faint">
                        {toEthiopicNumeral(v.verse_number)}
                      </span>
                      <span className="flex-1 font-amharic text-[14px] leading-[1.75] text-text-secondary">
                        {v.text_am}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-surface-border pt-4">
          <span className="font-amharic text-[13px] text-text-muted">
            {picked.size > 0 ? `${picked.size} ጥቅሶች ተመርጠዋል` : "ጥቅሶችን ይምረጡ"}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
              ዝጋ
            </Button>
            <Button
              onClick={handleAttach}
              disabled={picked.size === 0 || attachMutation.isPending}
            >
              {attachMutation.isPending ? "በማያዝ ላይ..." : "አያዝ"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
