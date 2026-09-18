import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SYNTAX_REFERENCE = [
  {
    syntax: "ቃል1 ቃል2",
    description: "ሁለቱንም ቃላት የያዙ ጥቅሶች (AND)",
  },
  {
    syntax: "ቃል1 AND ቃል2",
    description: "እንደ ላይ — ሁለቱም ቃላት",
  },
  {
    syntax: "ቃል1 OR ቃል2",
    description: "የመጀመሪያውን ወይም ሁለተኛውን የያዙ",
  },
  {
    syntax: "ቃል1 NOT ቃል2",
    description: "የመጀመሪያውን የያዙ ግን ሁለተኛውን የሌሉ",
  },
  {
    syntax: '"ሁለት ቃላት"',
    description: "በቅደም ተከተል የሚገኙ ሐረጎች",
  },
  {
    syntax: "ቃል1 <3> ቃል2",
    description: "በ3 ቃላት ርቀት ውስጥ የሚገኙ",
  },
];

export function AdvancedSyntaxHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
          "font-amharic text-[12px] font-medium",
          "text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary",
        )}
        aria-expanded={open}
      >
        <HelpCircle className="h-3.5 w-3.5" />
        የፍለጋ ምልክቶች
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-surface-border bg-surface shadow-2xl animate-fade-in">
            <header className="flex items-center justify-between border-b border-surface-border px-4 py-3">
              <h3 className="font-amharic text-[14px] font-semibold text-text-primary">
                የላቀ ፍለጋ ምልክቶች
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ዝጋ"
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>
            <ul className="divide-y divide-surface-border">
              {SYNTAX_REFERENCE.map((item) => (
                <li key={item.syntax} className="px-4 py-3">
                  <code className="mb-1 block font-mono text-[12px] text-gold-500">
                    {item.syntax}
                  </code>
                  <p className="font-amharic text-[12px] leading-[1.6] text-text-muted">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
            <footer className="border-t border-surface-border px-4 py-2.5">
              <p className="font-amharic text-[11px] text-text-faint">
                ምልክቶቹ በእንግሊዝኛ ብቻ ይሰራሉ (AND, OR, NOT)።
              </p>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}
