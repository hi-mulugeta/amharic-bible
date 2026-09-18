import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { useBooks, useChapter } from "@/api/queries/bible";
import { useAuthors } from "@/api/queries/authors";
import { useBulkCreateCommentaries, type SourceOut } from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ApiRequestError } from "@/api/client";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

const textareaClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3 py-2",
  "font-amharic text-[15px] leading-[1.8] text-text-primary placeholder:text-text-faint",
  "transition-colors resize-none",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

export function AdminCommentaryBulkEditor({
  sources,
  onSaved,
}: {
  sources: SourceOut[];
  onSaved?: () => void;
}) {
  const [bookSlug, setBookSlug] = useState("matthew");
  const [chapter, setChapter] = useState(1);
  const [authorSlug, setAuthorSlug] = useState<string>("");
  const [sourceId, setSourceId] = useState<number | "">("");
  const [isVerified, setIsVerified] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const books = useBooks("NT");
  const chapterQuery = useChapter(bookSlug, chapter, "AMH1954");
  const authors = useAuthors({ perPage: 200 });
  const bulkMutation = useBulkCreateCommentaries();

  useEffect(() => {
    setDrafts({});
    setResult(null);
    setError(null);
  }, [bookSlug, chapter]);

  const verses = chapterQuery.data?.verses ?? [];
  const filledCount = Object.values(drafts).filter(
    (v) => v.trim().length > 0,
  ).length;

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    const entries = Object.entries(drafts)
      .map(([verseNum, text]) => ({
        verse: Number(verseNum),
        content_am: text.trim(),
      }))
      .filter((e) => e.content_am.length > 0);

    if (entries.length === 0) {
      setError("ቢያንስ አንድ ትርጓሜ ይሙሉ");
      return;
    }

    setSaving(true);
    try {
      const response = await bulkMutation.mutateAsync({
        book_slug: bookSlug,
        chapter,
        translation_code: "AMH1954",
        author_slug: authorSlug || null,
        source_id: sourceId === "" ? null : Number(sourceId),
        is_verified: isVerified,
        commentaries: entries,
      });
      setResult(
        `${response.created} ትርጓሜዎች ተቀምጠዋል${
          response.skipped ? ` · ${response.skipped} ተዘሏል` : ""
        }`,
      );
      setDrafts({});
      onSaved?.();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-border bg-surface-raised/20 p-4">
        <p className="mb-4 font-amharic text-[13px] font-medium text-text-secondary">
          የትርጓሜ አውድ
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-faint">
              መጽሐፍ
            </label>
            <select
              value={bookSlug}
              onChange={(e) => {
                setBookSlug(e.target.value);
                setChapter(1);
              }}
              className={inputClass}
            >
              {books.data?.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name_am}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-faint">
              ምዕራፍ
            </label>
            <input
              type="number"
              min={1}
              value={chapter}
              onChange={(e) => setChapter(Math.max(1, Number(e.target.value)))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-faint">
              ደራሲ
            </label>
            <select
              value={authorSlug}
              onChange={(e) => setAuthorSlug(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {(authors.data?.data ?? []).map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name_am}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-faint">
              ምንጭ
            </label>
            <select
              value={sourceId}
              onChange={(e) =>
                setSourceId(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
            >
              <option value="">—</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title_am}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          <span className="font-amharic text-[13px] text-text-secondary">
            የተረጋገጠ (በሕዝብ ይታያል)
          </span>
        </label>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-amharic text-[13px] font-medium text-text-secondary">
            ለያንዳንዱ ጥቅስ ትርጓሜ ያስገቡ
          </p>
          <span className="text-[12px] tabular-nums text-text-faint">
            {toEthiopicNumeral(filledCount)} /{" "}
            {toEthiopicNumeral(verses.length)}
          </span>
        </div>

        {chapterQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : chapterQuery.isError || !chapterQuery.data ? (
          <p className="py-8 text-center font-amharic text-[13px] text-text-muted">
            ምዕራፉን መጫን አልተቻለም
          </p>
        ) : verses.length === 0 ? (
          <p className="py-8 text-center font-amharic text-[13px] text-text-muted">
            ለዚህ ምዕራፍ ጥቅሶች አልተገኙም። በመጀመሪያ ጥቅሶቹን ያስገቡ።
          </p>
        ) : (
          <div className="space-y-4">
            {verses.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-surface-border bg-surface-raised/10 p-4"
              >
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="min-w-[2rem] text-right text-[12px] font-semibold tabular-nums text-gold-500">
                    {toEthiopicNumeral(v.verse_number)}
                  </span>
                  <p className="font-amharic text-[13px] leading-[1.8] text-text-muted">
                    {v.text_am}
                  </p>
                </div>
                <textarea
                  value={drafts[v.verse_number] ?? ""}
                  onChange={(e) =>
                    setDrafts((d) => ({
                      ...d,
                      [v.verse_number]: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="የዚህ ጥቅስ ትርጓሜ..."
                  className={textareaClass}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border border-gold-500/30 bg-surface/95 px-4 py-3 backdrop-blur-lg">
        <div className="min-w-0 flex-1">
          {error && (
            <p className="font-amharic text-[13px] text-red-400">{error}</p>
          )}
          {result && (
            <p className="flex items-center gap-2 font-amharic text-[13px] text-gold-400">
              <Check className="h-3.5 w-3.5" />
              {result}
            </p>
          )}
          {!error && !result && (
            <p className="font-amharic text-[12px] text-text-faint">
              {filledCount > 0
                ? `${toEthiopicNumeral(filledCount)} ትርጓሜዎች ለማስቀመጥ ተዘጋጅተዋል`
                : "ትርጓሜዎችን ከላይ ይሙሉ"}
            </p>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={saving || filledCount === 0}>
          <Save className="h-4 w-4" />
          {saving ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
        </Button>
      </div>
    </div>
  );
}
