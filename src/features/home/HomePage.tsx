import { useReaderStore } from "@/stores/readerStore";
import { FastingChip } from "./FastingChip";
import { QuickSearchBar } from "./QuickSearchBar";
import { VerseOfDayCard } from "./VerseOfDayCard";
import { ContinueReadingCard } from "./ContinueReadingCard";
import { DailyReadingCard } from "./DailyReadingCard";
import { UpcomingFeastsRow } from "./UpcomingFeastsRow";
import { SaintsRow } from "./SaintsRow";

export function HomePage() {
  const { translationCode } = useReaderStore();

  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:px-8 md:py-14">
      {/* Greeting + fasting status */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
            እንኳን ደህና መጡ
          </h1>
          <p className="mt-1 font-amharic text-[14px] text-text-muted">
            የዕለቱ ቃል፣ ቅዱሳንና ምንባቦች
          </p>
        </div>
        <div>
          <FastingChip />
        </div>
      </header>

      {/* Quick search */}
      <div className="mb-8">
        <QuickSearchBar />
      </div>

      {/* Continue reading (silent until auth) */}
      <div className="mb-8">
        <ContinueReadingCard />
      </div>

      {/* Verse of the day */}
      <div className="mb-10">
        <VerseOfDayCard />
      </div>

      {/* Daily reading */}
      <div className="mb-10">
        <DailyReadingCard />
      </div>

      {/* Upcoming feasts — NEW */}
      <div className="mb-10">
        <UpcomingFeastsRow />
      </div>

      {/* Saints of the day */}
      <SaintsRow />

      <div className="h-16" />

      <p className="mt-12 text-center text-[11px] text-text-faint">
        ትርጉም: {translationCode} · ካተና መጽሐፍ ቅዱስ
      </p>
    </div>
  );
}
