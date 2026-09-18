import { Type, Check, Feather, Palette } from "lucide-react";
import { useReaderStore, type ReadingTheme } from "@/stores/readerStore";
import {
  FONT_SIZE_CLASS,
  FONT_SIZE_LABELS,
  FONT_SIZE_ORDER,
} from "@/lib/fontSize";
import {
  FONT_FAMILY_LABELS,
  FONT_FAMILY_DESCRIPTIONS,
  FONT_FAMILY_ORDER,
  fontFamilyStack,
} from "@/lib/fontFamily";
import {
  THEMES,
  THEME_LABELS,
  THEME_DESCRIPTIONS,
  THEME_ORDER,
  themePreviewColors,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { fontSize, setFontSize, fontFamily, setFontFamily, theme, setTheme } =
    useReaderStore();

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

      {/* ============================================================
          Theme
          ============================================================ */}
      <section className="mb-12">
        <header className="mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-gold-500/80" />
          <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
            ገጽታ
          </h2>
        </header>
        <p className="mb-5 font-amharic text-[13px] text-text-muted">
          ለንባብ ምቹ የሆነ የቀለም ገጽታ ይምረጡ።
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_ORDER.map((key) => {
            const active = theme === key;
            const preview = themePreviewColors(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                aria-pressed={active}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all",
                  active
                    ? "border-gold-500/60 ring-2 ring-gold-500/20"
                    : "border-surface-border hover:border-text-faint",
                )}
              >
                {/* Swatch preview */}
                <div
                  className="relative flex h-24 items-end justify-between p-3"
                  style={{ backgroundColor: preview.surface }}
                >
                  {/* Text preview */}
                  <div className="flex flex-col gap-1">
                    <div
                      className="h-2 w-16 rounded-full opacity-90"
                      style={{ backgroundColor: preview.text }}
                    />
                    <div
                      className="h-2 w-12 rounded-full opacity-60"
                      style={{ backgroundColor: preview.text }}
                    />
                    <div
                      className="h-2 w-20 rounded-full opacity-40"
                      style={{ backgroundColor: preview.text }}
                    />
                  </div>
                  {/* Accent dot */}
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: preview.accent }}
                  />
                </div>

                {/* Label row */}
                <div className="flex items-center justify-between gap-2 border-t border-surface-border bg-surface-raised/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-amharic text-[13px] font-medium text-text-primary">
                      {THEME_LABELS[key]}
                    </p>
                    <p className="mt-0.5 truncate font-amharic text-[11px] text-text-faint">
                      {THEME_DESCRIPTIONS[key]}
                    </p>
                  </div>
                  {active && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500">
                      <Check
                        className="h-3 w-3 text-stone-950"
                        strokeWidth={3}
                      />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          Font Family
          ============================================================ */}
      <section className="mb-12">
        <header className="mb-4 flex items-center gap-2">
          <Feather className="h-4 w-4 text-gold-500/80" />
          <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
            የንባብ ፊደል ዓይነት
          </h2>
        </header>
        <p className="mb-5 font-amharic text-[13px] text-text-muted">
          ለመጽሐፍ ቅዱስ ጥቅሶች የሚያገለግል የፊደል ቅርጽ።
        </p>

        <div className="space-y-2">
          {FONT_FAMILY_ORDER.map((key) => {
            const active = fontFamily === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFontFamily(key)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-colors",
                  active
                    ? "border-gold-500/40 bg-gold-500/[0.06]"
                    : "border-surface-border bg-surface-raised/20 hover:border-surface-border hover:bg-surface-raised/40",
                )}
              >
                <span
                  className={cn(
                    "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    active
                      ? "border-gold-500 bg-gold-500"
                      : "border-text-faint",
                  )}
                >
                  {active && (
                    <Check className="h-3 w-3 text-stone-950" strokeWidth={3} />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-amharic text-[14px] font-medium text-text-primary">
                      {FONT_FAMILY_LABELS[key]}
                    </p>
                    <p className="font-amharic text-[12px] text-text-faint">
                      {FONT_FAMILY_DESCRIPTIONS[key]}
                    </p>
                  </div>
                  <p
                    className="mt-2 text-[18px] text-text-secondary"
                    style={{
                      fontFamily: fontFamilyStack(key),
                      lineHeight: 1.6,
                    }}
                  >
                    በስመ አብ ወወልድ ወመንፈስ ቅዱስ
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          Font Size
          ============================================================ */}
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
                <div className="flex-1 min-w-0">
                  <p className="font-amharic text-[14px] font-medium text-text-primary">
                    {FONT_SIZE_LABELS[key]}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-text-secondary",
                      FONT_SIZE_CLASS[key],
                    )}
                    style={{
                      fontFamily: fontFamilyStack(fontFamily),
                      lineHeight: 1.5,
                    }}
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
