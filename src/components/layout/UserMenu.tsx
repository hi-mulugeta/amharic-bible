import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  Bookmark,
  Settings,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!user) return null;

  const initial = (user.display_name_am ?? user.username).trim().charAt(0);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-gold-500/15 text-gold-500 ring-1 ring-gold-500/30",
          "font-amharic text-[14px] font-semibold",
          "transition-colors hover:bg-gold-500/25",
        )}
        aria-label="መለያ"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-surface-border bg-stone-950 shadow-2xl animate-fade-in"
        >
          {/* Header */}
          <div className="border-b border-surface-border px-4 py-3">
            <p className="truncate font-amharic text-[14px] font-medium text-text-primary">
              {user.display_name_am ?? user.username}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-text-muted">
              {user.email}
            </p>
            {user.role !== "reader" && (
              <span className="mt-2 inline-block rounded-sm bg-gold-500/15 px-1.5 py-0.5 font-amharic text-[10px] font-medium uppercase tracking-wider text-gold-400">
                {user.role}
              </span>
            )}
          </div>

          {/* Items */}
          {/* Items */}
          {/* Items */}
          <div className="py-1">
            <MenuItem
              to="/library"
              icon={<Bookmark className="h-3.5 w-3.5" />}
              onClick={() => setOpen(false)}
            >
              የእኔ ማስታወሻዎች
            </MenuItem>
            {(user.role === "contributor" || user.role === "admin") && (
              <MenuItem
                to="/admin"
                icon={<Settings className="h-3.5 w-3.5" />}
                onClick={() => setOpen(false)}
              >
                አስተዳደር
              </MenuItem>
            )}
            <MenuItem
              to="/me"
              icon={<UserIcon className="h-3.5 w-3.5" />}
              onClick={() => setOpen(false)}
            >
              መገለጫ
            </MenuItem>
            <MenuItem
              to="/settings"
              icon={<Sliders className="h-3.5 w-3.5" />}
              onClick={() => setOpen(false)}
            >
              ቅንብሮች
            </MenuItem>
          </div>

          {/* Logout */}
          <div className="border-t border-surface-border py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-amharic text-[14px] text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              <LogOut className="h-3.5 w-3.5" />
              ውጣ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="flex items-center gap-3 px-4 py-2.5 font-amharic text-[14px] text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
    >
      {icon}
      {children}
    </Link>
  );
}
