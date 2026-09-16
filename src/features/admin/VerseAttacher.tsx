import { useState, useMemo } from "react";
import { Book as BookIcon, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";
import { useBooks, useChapter, type VerseOut } from "@/api/queries/bible";
import {
  useAttachVersesToTopic,
  useDetachVerseFromTopic,
} from "@/api/queries/admin";
import { useTopicVerses, type TopicOut } from "@/api/queries/discovery";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  topic: TopicOut | null;
};

export function VerseAttacher({ open, onOpenChange, topic }: Props) {
  const [selectedBook, setSelectedBook] = useState<string>("matthew");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const books = useBooks("NT"); // TODO: allow OT/NT toggle
  const chapter = useChapter(selectedBook, selectedChapter, "AMH1954");
  const existing = useTopicVerses(topic?.slug, { page: 1 });

  const attachMutation = useAttachVersesToTopic();
  const detachMutation = useDetachVerseFromTopic();

  const existingVerseIds = useMemo(() => {
    const set = new Set<number>();
    for (const v of existing.data?.data ?? []) {
      set.add(v.verse_id);
    }
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
    if (!topic || picked.size === 0) return;
    await attachMutation.mutateAsync({
      topicId: topic.id,
      verseIds: Array.from(picked),
    });
    setPicked(new Set());
  };

  const handleClose = () => {
    setPicked(new Set());
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={topic ? `${topic.name_am} — ጥቅሶች አያዝ` : "ጥቅሶች አያዝ"}
      size="lg"
    >
      <div className="space-y-5">
        {/* Book + chapter pickers */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-secondary">
              መጽሐፍ
            </label>
            <select
              value={selectedBook}
              onChange={(e) => {
                setSelectedBook(e.target.value);
                setSelectedChapter(1);
              }}
              className="w-full rounded-lg border border-surface-border bg-stone-950/40 px-3 py-2 font-amharic text-[14px] text-text-primary focus:border-gold-500/40 focus:outline-none"
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
              value={selectedChapter}
              onChange={(e) =>
                setSelectedChapter(Math.max(1, Number(e.target.value)))
              }
              className="w-full rounded-lg border border-surface-border bg-stone-950/40 px-3 py-2 font-amharic text-[14px] text-text-primary focus:border-gold-500/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Verses */}
        <div className="rounded-lg border border-surface-border">
          <div className="max-h-[320px] overflow-y-auto p-3">
            {chapter.isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : chapter.isError || !chapter.data ? (
              <p className="py-8 text-center font-amharic text-[13px] text-text-muted">
                ምዕራፉን መጫን አልተቻለም
              </p>
            ) : chapter.data.verses.length === 0 ? (
              <p className="py-8 text-center font-amharic text-[13px] text-text-muted">
                ጥቅስ አልተገኘም
              </p>
            ) : (
              <div className="space-y-0.5">
                {chapter.data.verses.map((v) => {
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

        {/* Footer */}
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
