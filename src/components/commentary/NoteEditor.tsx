import { useState, useEffect } from "react";
import { Trash2, FileText } from "lucide-react";
import {
  useNotesForVerse,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@/api/queries/user";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  verseId: number | null;
  verseReference?: string;
};

const COLORS = [
  { key: "yellow", label: "ወርቃማ", dot: "bg-gold-500" },
  { key: "green", label: "አረንጓዴ", dot: "bg-emerald-500" },
  { key: "blue", label: "ሰማያዊ", dot: "bg-sky-500" },
  { key: "pink", label: "ሮዝ", dot: "bg-pink-500" },
] as const;

export function NoteEditor({
  open,
  onOpenChange,
  verseId,
  verseReference,
}: Props) {
  const notes = useNotesForVerse(open ? verseId : null);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const [content, setContent] = useState("");
  const [color, setColor] = useState<string>("yellow");
  const [error, setError] = useState<string | null>(null);

  const existing = notes.data?.[0];
  const isEditing = Boolean(existing);

  useEffect(() => {
    if (open) {
      setContent(existing?.content_am ?? "");
      setColor(existing?.color ?? "yellow");
      setError(null);
    }
  }, [open, existing?.id]);

  const handleSave = async () => {
    if (!verseId) return;
    setError(null);
    if (!content.trim()) {
      setError("ማስታወሻው ባዶ ነው");
      return;
    }
    try {
      if (existing) {
        await updateMutation.mutateAsync({
          id: existing.id,
          verseId,
          content_am: content.trim(),
          color,
        });
      } else {
        await createMutation.mutateAsync({
          verse_id: verseId,
          content_am: content.trim(),
          color,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  const handleDelete = async () => {
    if (!existing || !verseId) return;
    try {
      await deleteMutation.mutateAsync({ id: existing.id, verseId });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "ማስታወሻ አርትዕ" : "ማስታወሻ ጻፍ"}
      size="md"
    >
      <div className="space-y-5">
        {/* Reference pill */}
        {verseReference && (
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-3 py-1.5 ring-1 ring-gold-500/20">
            <FileText className="h-3.5 w-3.5 text-gold-500" />
            <span className="font-amharic text-[13px] text-gold-400">
              {verseReference}
            </span>
          </div>
        )}

        {/* Textarea with subtle color edge */}
        <div className="relative">
          <div
            className={cn(
              "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-colors",
              colorClass(color),
            )}
            aria-hidden
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            autoFocus
            placeholder="ስለዚህ ጥቅስ ያሰቡትን ይጻፉ..."
            className={cn(
              "w-full rounded-xl border border-surface-border bg-stone-950/50",
              "pl-5 pr-4 py-3.5",
              "font-amharic text-[16px] leading-[1.9] text-text-primary placeholder:text-text-faint",
              "transition-colors resize-none",
              "focus:border-gold-500/40 focus:bg-stone-950/70 focus:outline-none",
            )}
          />
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-3">
          <span className="font-amharic text-[13px] text-text-muted">ቀለም</span>
          <div className="flex items-center gap-2">
            {COLORS.map((c) => {
              const active = color === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={active}
                  className={cn(
                    "relative h-6 w-6 rounded-full transition-all",
                    c.dot,
                    active
                      ? "ring-2 ring-offset-2 ring-offset-stone-950 ring-gold-500/60 scale-110"
                      : "opacity-60 hover:opacity-100 hover:scale-105",
                  )}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {isEditing ? (
            <ConfirmButton
              onConfirm={handleDelete}
              busy={deleteMutation.isPending}
            >
              <Trash2 className="inline h-3.5 w-3.5 mr-1.5 align-[-2px]" />
              ሰርዝ
            </ConfirmButton>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              ሰርዝ
            </Button>
            <Button onClick={handleSave} disabled={busy}>
              {busy ? "በማስቀመጥ ላይ..." : isEditing ? "አዘምን" : "አስቀምጥ"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function colorClass(color: string | undefined): string {
  switch (color) {
    case "green":
      return "bg-emerald-500";
    case "blue":
      return "bg-sky-500";
    case "pink":
      return "bg-pink-500";
    default:
      return "bg-gold-500";
  }
}
