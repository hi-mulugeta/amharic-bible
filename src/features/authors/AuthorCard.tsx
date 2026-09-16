import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { AuthorOut } from "@/api/queries/authors";
import { eraLabel } from "@/lib/era";

export function AuthorCard({ author }: { author: AuthorOut }) {
  const era = eraLabel(author.era);
  const lifespan = formatLifespan(author.birth_year, author.death_year);

  return (
    <Link
      to={`/authors/${author.slug}`}
      className="group flex items-start gap-4 rounded-xl border border-surface-border bg-surface-raised/20 p-5 transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40"
    >
      <AuthorAvatar author={author} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="font-amharic text-[16px] font-semibold leading-snug text-text-primary group-hover:text-gold-400 transition-colors">
            {author.name_am}
          </h3>
          {author.ethiopian_venerated && (
            <span
              title="በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ዘንድ የተከበረ"
              className="inline-flex items-center gap-0.5 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold-400"
            >
              <Sparkles className="h-2.5 w-2.5" />
              ተከብሯል
            </span>
          )}
        </div>

        {author.name_en && (
          <p className="mt-0.5 truncate text-[13px] text-text-muted">
            {author.name_en}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-faint">
          {era && <span className="font-amharic">{era}</span>}
          {era && lifespan && <span>·</span>}
          {lifespan && <span>{lifespan}</span>}
        </div>
      </div>
    </Link>
  );
}

/**
 * Deterministic avatar. Uses image_url when present; otherwise
 * shows the first Ethiopic character of the Amharic name.
 */
export function AuthorAvatar({
  author,
  size = "md",
}: {
  author: AuthorOut;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-9 w-9 text-[13px]",
    md: "h-12 w-12 text-[16px]",
    lg: "h-20 w-20 text-[26px]",
  }[size];

  const initial = author.name_am.trim().charAt(0);

  if (author.image_url) {
    return (
      <img
        src={author.image_url}
        alt={author.name_am}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-surface-border`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gold-500/10 font-amharic font-semibold text-gold-500/90 ring-1 ring-gold-500/20`}
    >
      {initial}
    </div>
  );
}

function formatLifespan(
  birth: number | null,
  death: number | null,
): string | null {
  if (!birth && !death) return null;
  if (birth && death) return `${birth}–${death}`;
  if (birth) return `b. ${birth}`;
  return `d. ${death}`;
}
