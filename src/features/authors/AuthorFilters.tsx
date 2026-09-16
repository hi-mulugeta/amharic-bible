import { cn } from "@/lib/utils";
import { eraLabel } from "@/lib/era";

const ERAS = ["Apostolic", "Ante-Nicene", "Nicene", "Post-Nicene"] as const;

type Props = {
  era: string | undefined;
  ethiopianOnly: boolean;
  onEraChange: (era: string | undefined) => void;
  onEthiopianToggle: (next: boolean) => void;
};

export function AuthorFilters({
  era,
  ethiopianOnly,
  onEraChange,
  onEthiopianToggle,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Era chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip
          active={!era}
          onClick={() => onEraChange(undefined)}
          label="ሁሉም"
        />
        {ERAS.map((e) => (
          <Chip
            key={e}
            active={era === e}
            onClick={() => onEraChange(e)}
            label={eraLabel(e) ?? e}
          />
        ))}
      </div>

      {/* Ethiopian venerated toggle */}
      <div className="ml-auto">
        <Chip
          active={ethiopianOnly}
          onClick={() => onEthiopianToggle(!ethiopianOnly)}
          label="በኢትዮጵያ የተከበሩ"
        />
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-amharic text-[13px] font-medium transition-colors",
        active
          ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
          : "border-surface-border bg-surface-raised/20 text-text-secondary hover:border-surface-border hover:bg-surface-raised/40 hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}
