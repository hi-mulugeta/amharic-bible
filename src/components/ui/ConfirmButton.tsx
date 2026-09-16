import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  onConfirm: () => void;
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
  busy?: boolean;
};

export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "በእርግጠኝነት ሰርዝ",
  className,
  busy,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), 4000);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfirming(false);
    onConfirm();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={cn(
        "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
        confirming
          ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
          : "text-text-muted hover:bg-surface-raised hover:text-text-primary",
        busy && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {confirming ? confirmLabel : children}
    </button>
  );
}
