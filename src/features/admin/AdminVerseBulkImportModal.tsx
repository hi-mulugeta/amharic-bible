import { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { useBulkCreateVerses } from "@/api/queries/admin";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

const textareaClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3 py-2.5",
  "font-mono text-[13px] leading-[1.7] text-text-primary placeholder:text-text-faint",
  "transition-colors resize-none",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

const PLACEHOLDER = `[
  {"verse": 1, "text": "የኢየሱስ ክርስቶስ..."},
  {"verse": 2, "text": "አብርሃም ይስሐቅን ወለደ..."}
]`;

export function AdminVerseBulkImportModal({
  open,
  onOpenChange,
  bookSlug,
  chapter,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookSlug: string;
  chapter: number;
}) {
  const bulkMutation = useBulkCreateVerses();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setRaw("");
      setError(null);
      setResult(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    setResult(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setError("JSON ልክ አይደለም። እባክዎ የJSON አወቃቀሩን ያረጋግጡ።");
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      setError("JSON የጥቅሶች ዝርዝር (array) መሆን አለበት።");
      return;
    }

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (
        typeof item !== "object" ||
        item === null ||
        typeof (item as { verse?: unknown }).verse !== "number" ||
        typeof (item as { text?: unknown }).text !== "string"
      ) {
        setError(
          `ቁጥር ${i + 1}: እያንዳንዱ ግቤት {"verse": N, "text": "..."} መሆን አለበት።`,
        );
        return;
      }
    }

    try {
      const response = await bulkMutation.mutateAsync({
        translation_code: "AMH1954",
        book_slug: bookSlug,
        chapter,
        verses: parsed as Array<{ verse: number; text: string }>,
      });
      setResult(
        `${response.created} ጥቅሶች ተቀምጠዋል${
          response.skipped ? ` · ${response.skipped} ተዘሏል` : ""
        }`,
      );
      setTimeout(() => {
        onOpenChange(false);
      }, 1400);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="በጅምላ ጥቅሶችን አስገባ"
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-surface-raised/30 px-3 py-2">
          <p className="font-amharic text-[12px] text-text-faint">
            {bookSlug} · ምዕራፍ {chapter}
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-gold-500/30 bg-gold-500/[0.04] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          <div className="min-w-0 flex-1">
            <p className="font-amharic text-[13px] leading-[1.7] text-text-secondary">
              የJSON ዝርዝር ያስገቡ። እያንዳንዱ ግቤት የ
              <span className="font-medium text-gold-500">ጥቅስ ቁጥር</span> እና{" "}
              <span className="font-medium text-gold-500">ጽሑፍ</span> መያዝ አለበት።
            </p>
            <p className="mt-2 font-mono text-[11px] text-text-faint">
              {`{"verse": 1, "text": "..."}`}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            JSON
          </label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={12}
            placeholder={PLACEHOLDER}
            className={textareaClass}
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.05] p-3">
            <p className="font-amharic text-[13px] text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="flex items-center gap-2 rounded-lg border border-gold-500/30 bg-gold-500/[0.05] p-3">
            <Check className="h-4 w-4 shrink-0 text-gold-500" />
            <p className="font-amharic text-[13px] text-gold-400">{result}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button
            onClick={submit}
            disabled={bulkMutation.isPending || !raw.trim()}
          >
            {bulkMutation.isPending ? "በማስገባት ላይ..." : "አስገባ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
