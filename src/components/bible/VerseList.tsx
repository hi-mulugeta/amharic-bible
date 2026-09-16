import { useEffect, useRef } from "react";
import type { VerseOut } from "@/api/queries/bible";
import type { HighlightOut, NoteOut } from "@/api/queries/user";
import { VerseItem } from "./VerseItem";

type Props = {
  verses: VerseOut[];
  selectedVerseId: number | null;
  onSelectVerse: (v: VerseOut) => void;
  highlights?: HighlightOut[];
  notes?: NoteOut[];
};

export function VerseList({
  verses,
  selectedVerseId,
  onSelectVerse,
  highlights,
  notes,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedVerseId === null) return;
    const el = containerRef.current?.querySelector<HTMLButtonElement>(
      `[data-verse-id="${selectedVerseId}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedVerseId]);

  const verseIdsWithNotes = new Set(notes?.map((n) => n.verse_id) ?? []);

  return (
    <div ref={containerRef} className="space-y-1">
      {verses.map((v) => (
        <VerseItem
          key={v.id}
          verse={v}
          isSelected={v.id === selectedVerseId}
          onSelect={onSelectVerse}
          highlightColor={findHighlightColor(highlights, v.verse_number)}
          hasNote={verseIdsWithNotes.has(v.id)}
        />
      ))}
    </div>
  );
}

function findHighlightColor(
  highlights: HighlightOut[] | undefined,
  verseNumber: number,
): string | null {
  if (!highlights) return null;
  const vn = Number(verseNumber);
  for (const h of highlights) {
    if (Number(h.start_verse) <= vn && Number(h.end_verse) >= vn) {
      return h.color;
    }
  }
  return null;
}
