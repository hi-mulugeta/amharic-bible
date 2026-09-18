import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TestamentFilter = "OT" | "NT" | "ALL";
export type ReadingFontSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type ReadingFontFamily = "noto-sans" | "menbere";
export type ReadingTheme = "parchment" | "stone" | "midnight";

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

  fontSize: ReadingFontSize;
  setFontSize: (size: ReadingFontSize) => void;

  fontFamily: ReadingFontFamily;
  setFontFamily: (family: ReadingFontFamily) => void;

  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
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

      fontFamily: "noto-sans",
      setFontFamily: (family) => set({ fontFamily: family }),

      theme: "parchment",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "catena-reader",
      partialize: (s) => ({
        translationCode: s.translationCode,
        sidebarTestament: s.sidebarTestament,
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        theme: s.theme,
      }),
    },
  ),
);
