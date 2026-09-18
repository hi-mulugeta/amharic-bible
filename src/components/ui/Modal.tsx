import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  size = "md",
}: Props) {
  const maxWidth = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-surface-border bg-surface shadow-2xl",
            "max-h-[90vh] overflow-y-auto",
            maxWidth,
          )}
        >
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <Dialog.Title className="font-amharic text-[16px] font-semibold text-text-primary">
              {title ?? ""}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {title ?? ""}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                aria-label="ዝጋ"
                className="-mr-1 rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
