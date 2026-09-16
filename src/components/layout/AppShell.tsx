import type { ReactNode } from "react";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-950 text-text-primary">
      <Header />
      <main>{children}</main>
    </div>
  );
}
