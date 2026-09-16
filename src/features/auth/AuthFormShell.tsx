import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  titleAm: string;
  subtitleAm: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthFormShell({
  titleAm,
  subtitleAm,
  children,
  footer,
}: Props) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-5 py-14">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 ring-1 ring-gold-500/30">
          <BookOpen className="h-5 w-5 text-gold-500" />
        </div>
        <h1 className="font-amharic text-2xl font-semibold text-text-primary">
          {titleAm}
        </h1>
        <p className="mt-2 font-amharic text-[14px] text-text-muted">
          {subtitleAm}
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-surface-border bg-surface-raised/20 p-6 md:p-8">
        {children}
      </div>

      {/* Footer link */}
      <div className="mt-6 text-center font-amharic text-[14px] text-text-muted">
        {footer}
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 font-amharic text-[12px] text-red-400">{message}</p>
  );
}
