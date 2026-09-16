import { useEffect, useRef } from "react";
import type { VerseOut } from "@/api/queries/bible";
import { VerseItem } from "./VerseItem";

type Props = {
  verses: VerseOut[];
  selectedVerseId: number | null;
  onSelectVerse: (v: VerseOut) => void;
};

export function VerseList({ verses, selectedVerseId, onSelectVerse }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // When the selected verse changes, ensure it's visible
  useEffect(() => {
    if (selectedVerseId === null) return;
    const el = containerRef.current?.querySelector<HTMLButtonElement>(
      `[data-verse-id="${selectedVerseId}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedVerseId]);

  return (
    <div ref={containerRef} className="space-y-1">
      {verses.map((v) => (
        <VerseItem
          key={v.id}
          verse={v}
          isSelected={v.id === selectedVerseId}
          onSelect={onSelectVerse}
        />
      ))}
    </div>
  );
}
