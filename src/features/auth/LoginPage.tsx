import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { ApiRequestError } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { FieldError, AuthFormShell } from "./AuthFormShell";
import { cn } from "@/lib/utils";

export const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ email: email.trim(), password });
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.messageAm || err.message_en || "መግባት አልተቻለም");
      } else {
        setError("መግባት አልተቻለም");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFormShell
      titleAm="ግባ"
      subtitleAm="ወደ ካተና መጽሐፍ ቅዱስ እንኳን ደህና ተመለሱ"
      footer={
        <>
          መለያ የለዎትም?{" "}
          <Link
            to={
              next === "/"
                ? "/register"
                : `/register?next=${encodeURIComponent(next)}`
            }
            className="font-medium text-gold-500 transition-colors hover:text-gold-400"
          >
            ይመዝገቡ
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ኢሜይል
          </label>
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የይለፍ ቃል
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <FieldError message={error} />

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "በመግባት ላይ..." : "ግባ"}
        </Button>
      </form>
    </AuthFormShell>
  );
}
