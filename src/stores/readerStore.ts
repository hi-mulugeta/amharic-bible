import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TestamentFilter = "OT" | "NT" | "ALL";
export type ReadingFontSize = "sm" | "md" | "lg" | "xl" | "2xl";

type ReaderState = {
  selectedVerseId: number | null;
  selectVerse: (id: number | null) => void;

  translationCode: string;
  setTranslation: (code: string) => void;

  commentaryOpen: boolean;
  setCommentaryOpen: (open: boolean) => void;

  sidebarTestament: TestamentFilter;
  setSidebarTestament: (t: TestamentFilter) => void;

  expandedBookSlug: string | null;
  setExpandedBook: (slug: string | null) => void;

  // Reading font size preference
  fontSize: ReadingFontSize;
  setFontSize: (size: ReadingFontSize) => void;
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      selectedVerseId: null,
      selectVerse: (id) => set({ selectedVerseId: id }),

      translationCode: "AMH1954",
      setTranslation: (code) => set({ translationCode: code }),

      commentaryOpen: false,
      setCommentaryOpen: (open) => set({ commentaryOpen: open }),

      sidebarTestament: "NT",
      setSidebarTestament: (t) => set({ sidebarTestament: t }),

      expandedBookSlug: null,
      setExpandedBook: (slug) => set({ expandedBookSlug: slug }),

      fontSize: "lg",
      setFontSize: (size) => set({ fontSize: size }),
    }),
    {
      name: "catena-reader",
      partialize: (s) => ({
        translationCode: s.translationCode,
        sidebarTestament: s.sidebarTestament,
        fontSize: s.fontSize,
      }),
    },
  ),
);
