import { Type, Check } from "lucide-react";
import { useReaderStore, type ReadingFontSize } from "@/stores/readerStore";
import {
  FONT_SIZE_CLASS,
  FONT_SIZE_LABELS,
  FONT_SIZE_ORDER,
} from "@/lib/fontSize";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { fontSize, setFontSize } = useReaderStore();

  return (
    <div className="mx-auto max-w-reading px-5 py-10 md:px-8 md:py-14">
      <header className="mb-8 border-b border-surface-border pb-6">
        <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
          ቅንብሮች
        </h1>
        <p className="mt-2 font-amharic text-[14px] text-text-muted">
          የመጽሐፍ ቅዱስ ንባብዎን እንደፍላጎትዎ ያስተካክሉ።
        </p>
      </header>

      <section>
        <header className="mb-4 flex items-center gap-2">
          <Type className="h-4 w-4 text-gold-500/80" />
          <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
            የንባብ ፊደል መጠን
          </h2>
        </header>

        <p className="mb-5 font-amharic text-[13px] text-text-muted">
          ይህ ለመጽሐፍ ቅዱስ ጥቅሶች ብቻ ይተገበራል።
        </p>

        {/* Size options */}
        <div className="space-y-2">
          {FONT_SIZE_ORDER.map((key) => {
            const active = fontSize === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFontSize(key)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-gold-500/40 bg-gold-500/[0.06]"
                    : "border-surface-border bg-surface-raised/20 hover:border-surface-border hover:bg-surface-raised/40",
                )}
              >
                {/* Radio circle */}
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    active
                      ? "border-gold-500 bg-gold-500"
                      : "border-text-faint",
                  )}
                >
                  {active && (
                    <Check className="h-3 w-3 text-stone-950" strokeWidth={3} />
                  )}
                </span>

                {/* Label + preview */}
                <div className="flex-1 min-w-0">
                  <p className="font-amharic text-[14px] font-medium text-text-primary">
                    {FONT_SIZE_LABELS[key]}
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-amharic text-text-secondary",
                      FONT_SIZE_CLASS[key],
                    )}
                    style={{ lineHeight: 1.5 }}
                  >
                    በስመ አብ ወወልድ ወመንፈስ ቅዱስ
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 font-amharic text-[12px] text-text-faint">
          የመረጡት ቅንብር በራስ-ሰር ይቀመጣል።
        </p>
      </section>

      <div className="h-16" />
    </div>
  );
}
