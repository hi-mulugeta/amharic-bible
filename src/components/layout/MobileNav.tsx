import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string };

export function MobileNav({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Item[];
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm md:hidden animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 border-r border-surface-border bg-stone-950 p-6 md:hidden animate-slide-up">
          <Dialog.Title className="sr-only">ዝርዝር</Dialog.Title>
          <div className="mb-8">
            <span className="font-amharic text-lg font-semibold text-text-primary">
              ካተና መጽሐፍ ቅዱስ
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "rounded-lg px-4 py-3 font-amharic text-base text-text-secondary transition-colors",
                  "hover:bg-surface-raised hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
