import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/auth/AuthContext";
import { Logo } from "@/components/brand/Logo";

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
      <div className="mx-auto grid h-16 max-w-shell grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6 md:px-6">
        {/* LEFT: mobile menu + brand */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="md:hidden -ml-1 p-2 text-text-secondary transition-colors hover:text-text-primary"
            aria-label="ዝርዝር ክፈት"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" aria-label="ካተና — መነሻ" className="flex items-center">
            <Logo size="lg" />
          </Link>
        </div>

        {/* CENTER: desktop nav */}
        <nav className="hidden md:flex items-center justify-center gap-1">
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
                  "relative rounded-md px-3 py-1.5 font-amharic text-sm transition-colors",
                  active
                    ? "text-brand"
                    : "text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary",
                )}
              >
                {item.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: actions */}
        <div className="flex items-center justify-end gap-2">
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
