import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";

// ---------- Types ----------

export type VerseOfDayOut = {
  id: number;
  gregorian_date: string;
  ethiopian_year: number;
  ethiopian_month: number;
  ethiopian_day: number;
  ethiopian_month_name: string;
  verse_id: number | null;
  verse_number: number | null;
  verse_number_ethiopic: string | null;
  book_slug: string | null;
  book_name_am: string | null;
  chapter: number | null;
  text_am: string | null;
  reflection_am: string | null;
  commentary_id: number | null;
};

export type ReadingVerse = {
  id: number;
  verse_number: number;
  verse_number_ethiopic: string;
  text_am: string;
  commentary_count?: number;
};

export type ReadingBlock = {
  kind: string;
  book_slug: string;
  book_name_am: string;
  chapter: number;
  chapter_ethiopic: string;
  start: number;
  end: number;
  start_ethiopic: string;
  end_ethiopic: string;
  verses: ReadingVerse[];
};

export type LectionaryReadingOut = {
  id: number;
  gregorian_date: string;
  ethiopian_year: number;
  ethiopian_month: number;
  ethiopian_day: number;
  ethiopian_month_name: string;
  title_am: string | null;
  description_am: string | null;
  readings: ReadingBlock[];
};

export type SaintOut = {
  id: number;
  slug: string;
  name_am: string;
  name_en: string | null;
  title_am: string | null;
  short_bio_am: string | null;
  long_bio_am: string | null;
  image_url: string | null;
  ethiopian_month: number;
  ethiopian_day: number;
  is_feast: boolean;
};

export type FeastDayOut = {
  id: number;
  gregorian_date: string | null;
  ethiopian_month: number;
  ethiopian_day: number;
  ethiopian_month_name: string | null;
  kind: string;
  name_am: string;
  name_en: string | null;
  description_am: string | null;
  breaks_fast: boolean;
};

export type FastingTodayOut = {
  gregorian_date: string;
  ethiopian: {
    year: number;
    month: number;
    day: number;
    month_name: string;
    display: string;
  };
  is_fasting: boolean;
  reason_am: string | null;
  feasts_today?: FeastDayOut[];
};

// ---------- Keys ----------

export const liturgyKeys = {
  all: ["liturgy"] as const,
  verseOfDay: () => [...liturgyKeys.all, "verse-of-day"] as const,
  daily: () => [...liturgyKeys.all, "daily"] as const,
  saintsToday: () => [...liturgyKeys.all, "saints", "today"] as const,
  saint: (slug: string) => [...liturgyKeys.all, "saint", slug] as const,
  fastingToday: () => [...liturgyKeys.all, "fasting", "today"] as const,
};

// ---------- Hooks ----------

export function useVerseOfDay(translation = "AMH1954") {
  return useQuery({
    queryKey: [...liturgyKeys.verseOfDay(), translation],
    queryFn: () =>
      request<VerseOfDayOut | null>("/api/liturgy/verse-of-day", {
        query: { translation },
      }),
    staleTime: 30 * 60 * 1000, // 30 min
  });
}

export function useDailyReading(translation = "AMH1954") {
  return useQuery({
    queryKey: [...liturgyKeys.daily(), translation],
    queryFn: () =>
      request<LectionaryReadingOut | null>("/api/liturgy/daily", {
        query: { translation },
      }),
    staleTime: 30 * 60 * 1000,
  });
}

export function useSaintsToday() {
  return useQuery({
    queryKey: liturgyKeys.saintsToday(),
    queryFn: () => request<SaintOut[]>("/api/liturgy/saints/today"),
    staleTime: 60 * 60 * 1000,
  });
}

export function useSaint(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: liturgyKeys.saint(slug ?? ""),
    queryFn: () => request<SaintOut>(`/api/liturgy/saints/${slug}/detail`),
    staleTime: 60 * 60 * 1000,
  });
}
export function useAllSaints(opts?: {
  page?: number;
  perPage?: number;
  month?: number;
}) {
  const page = opts?.page ?? 1;
  return useQuery({
    queryKey: [
      ...liturgyKeys.all,
      "saints",
      "all",
      page,
      opts?.month ?? "any",
    ] as const,
    queryFn: () =>
      request<{
        data: SaintOut[];
        meta: {
          page: number;
          per_page: number;
          total: number;
          pages: number;
          has_next: boolean;
          has_prev: boolean;
        };
      }>("/api/liturgy/saints", {
        query: {
          page,
          per_page: opts?.perPage ?? 50,
          month: opts?.month,
        },
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
}
export function useFastingToday() {
  return useQuery({
    queryKey: liturgyKeys.fastingToday(),
    queryFn: () => request<FastingTodayOut>("/api/liturgy/fasting/today"),
    staleTime: 60 * 60 * 1000,
  });
}
export function useUpcomingFeasts(days = 90) {
  return useQuery({
    queryKey: [...liturgyKeys.all, "feasts", "upcoming", days],
    queryFn: () =>
      request<FeastDayOut[]>("/api/liturgy/feasts/upcoming", {
        query: { days },
      }),
    staleTime: 60 * 60 * 1000,
  });
}
// ============================================================
// Calendar & additional saint queries
// ============================================================

export type CalendarMonth = {
  month: number;
  month_name: string;
  feasts: FeastDayOut[];
};

export type CalendarYear = {
  ethiopian_year: number;
  gregorian_new_year: string;
  months: CalendarMonth[];
};

export function useFeastsCalendar(year: number | undefined) {
  return useQuery({
    enabled: typeof year === "number",
    queryKey: [...liturgyKeys.all, "calendar", year ?? 0],
    queryFn: () => request<CalendarYear>(`/api/liturgy/calendar/${year}`),
    staleTime: 60 * 60 * 1000,
  });
}

export function useSaintsForDate(d: string | undefined) {
  return useQuery({
    enabled: Boolean(d),
    queryKey: [...liturgyKeys.all, "saints", "date", d ?? ""],
    queryFn: () => request<SaintOut[]>(`/api/liturgy/saints/${d}`),
    staleTime: 60 * 60 * 1000,
  });
}

// ============================================================
// Prayers
// ============================================================

export type PrayerSummary = {
  id: number;
  slug: string;
  title_am: string;
  title_en: string | null;
  category: string | null;
  source_am: string | null;
};

export type PrayerOut = PrayerSummary & {
  body_am: string;
  body_transliteration: string | null;
  body_en: string | null;
};

export function usePrayers(opts?: {
  page?: number;
  perPage?: number;
  category?: string;
}) {
  const page = opts?.page ?? 1;
  return useQuery({
    queryKey: [...liturgyKeys.all, "prayers", page, opts?.category ?? "all"],
    queryFn: () =>
      request<{
        data: PrayerSummary[];
        meta: {
          page: number;
          per_page: number;
          total: number;
          pages: number;
          has_next: boolean;
          has_prev: boolean;
        };
      }>("/api/liturgy/prayers", {
        query: {
          page,
          per_page: opts?.perPage ?? 30,
          category: opts?.category,
        },
      }),
    placeholderData: (prev) => prev,
    staleTime: 60 * 60 * 1000,
  });
}

export function usePrayer(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: [...liturgyKeys.all, "prayer", slug ?? ""],
    queryFn: () => request<PrayerOut>(`/api/liturgy/prayers/${slug}`),
    staleTime: 60 * 60 * 1000,
  });
}

export const PRAYER_CATEGORIES = [
  { key: "morning", label: "የንጋት" },
  { key: "evening", label: "የምሽት" },
  { key: "eucharist", label: "የቅዱስ ቁርባን" },
  { key: "marian", label: "ማርያማዊ" },
  { key: "intercession", label: "ምልጃ" },
  { key: "other", label: "ሌላ" },
] as const;
