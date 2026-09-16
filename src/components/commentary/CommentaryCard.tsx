import type { CommentaryOut } from "@/api/queries/commentaries";
import { cn } from "@/lib/utils";

export function CommentaryCard({ commentary }: { commentary: CommentaryOut }) {
  const { author, source, content_am } = commentary;

  return (
    <article className="p-5">
      {/* Author line */}
      {author && (
        <header className="mb-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-amharic text-[15px] font-semibold text-text-primary">
              {author.name_am}
            </h3>
            {author.ethiopian_venerated && (
              <span className="rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                በኢትዮጵያ የተከበረ
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {author.name_en}
            {author.era && (
              <>
                {" · "}
                <span className="text-text-faint">{author.era}</span>
              </>
            )}
          </p>
          {source && (
            <p className="mt-1 font-amharic text-xs text-text-faint italic">
              {source}
            </p>
          )}
        </header>
      )}

      {/* Body */}
      <div className="font-amharic text-[17px] leading-[1.9] text-text-secondary whitespace-pre-line">
        {content_am}
      </div>
    </article>
  );
}
