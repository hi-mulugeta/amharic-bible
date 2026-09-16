import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { ApiRequestError } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { AuthFormShell, FieldError } from "./AuthFormShell";
import { inputClass } from "./LoginPage";

export function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/";
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError("የተጠቃሚ ስም ቢያንስ 3 ፊደሎች መሆን አለበት");
      return;
    }
    if (password.length < 8) {
      setError("የይለፍ ቃል ቢያንስ 8 ፊደሎች መሆን አለበት");
      return;
    }

    setBusy(true);
    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
        display_name_am: displayName.trim() || undefined,
      });
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.messageAm || err.message_en || "ምዝገባ አልተሳካም");
      } else {
        setError("ምዝገባ አልተሳካም");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFormShell
      titleAm="ይመዝገቡ"
      subtitleAm="ትርጓሜዎችን ለማስቀመጥ እና የግል ማስታወሻ ለመያዝ መለያ ይፍጠሩ"
      footer={
        <>
          መለያ አለዎት?{" "}
          <Link
            to={
              next === "/"
                ? "/login"
                : `/login?next=${encodeURIComponent(next)}`
            }
            className="font-medium text-gold-500 transition-colors hover:text-gold-400"
          >
            ይግቡ
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
            የተጠቃሚ ስም
          </label>
          <input
            type="text"
            required
            autoComplete="username"
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ስም <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ለምሳሌ: ሙሉጌታ"
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
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 font-amharic text-[11px] text-text-faint">
            ቢያንስ 8 ፊደሎች
          </p>
        </div>

        <FieldError message={error} />

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "በመመዝገብ ላይ..." : "ተመዝገብ"}
        </Button>
      </form>
    </AuthFormShell>
  );
}
