import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="በመጫን ላይ"
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500",
        className,
      )}
    />
  );
}
