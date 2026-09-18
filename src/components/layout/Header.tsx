import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/auth/AuthContext";

export function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const navItems = [
    { to: "/", label: "ዛሬ" },
    { to: "/bible", label: "መጽሐፍ ቅዱስ" },
    { to: "/liturgy", label: "ሥርዓት" },
    { to: "/authors", label: "አበው" },
    { to: "/topics", label: "ማሰስ" },
  ];

  // Global "/" to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable)
        return;
      e.preventDefault();
      navigate("/search");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-shell items-center gap-6 px-4 md:px-6">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="md:hidden -ml-2 p-2 text-text-secondary transition-colors hover:text-text-primary"
          aria-label="ዝርዝር ክፈት"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 ring-1 ring-gold-500/30 transition-colors group-hover:bg-gold-500/15">
            <BookOpen className="h-4 w-4 text-gold-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-amharic text-[15px] font-semibold text-text-primary">
              ካተና
            </span>
            <span className="font-latin text-[10px] uppercase tracking-wider text-text-faint">
              Catena
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-1.5 font-amharic text-sm transition-colors",
                  active
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/search"
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            aria-label="ፈልግ"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          {authLoading ? null : isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 font-amharic text-[14px] font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              ግባ
            </Link>
          )}
        </div>
      </div>

      <MobileNav open={navOpen} onOpenChange={setNavOpen} items={navItems} />
    </header>
  );
}
