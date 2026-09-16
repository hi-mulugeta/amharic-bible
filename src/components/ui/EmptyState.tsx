import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  titleAm: string;
  titleEn?: string;
  hintAm?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  titleAm,
  titleEn,
  hintAm,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      )}
    >
      {icon && (
        <div className="mb-6 text-gold-500/60 [&>svg]:h-12 [&>svg]:w-12">
          {icon}
        </div>
      )}
      <h3 className="font-amharic text-xl text-text-primary mb-2">
        {titleAm}
      </h3>
      {titleEn && <p className="text-text-muted text-sm mb-3">{titleEn}</p>}
      {hintAm && (
        <p className="font-amharic text-verse-sm text-text-muted max-w-md">
          {hintAm}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
