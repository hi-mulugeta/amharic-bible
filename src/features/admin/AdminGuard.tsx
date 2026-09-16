import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ReactNode } from "react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-reader px-5 py-14">
        <EmptyState
          icon={<ShieldAlert />}
          titleAm="የመግቢያ ፈቃድ ያስፈልጋል"
          hintAm="ይህን ገጽ ለመድረስ መግባት ያስፈልጋል።"
          action={
            <Link
              to="/login?next=/admin"
              className="inline-flex rounded-lg bg-gold-500 px-4 py-2 font-amharic text-[14px] font-medium text-stone-950 transition-colors hover:bg-gold-400"
            >
              ግባ
            </Link>
          }
        />
      </div>
    );
  }

  if (user.role !== "contributor" && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-reader px-5 py-14">
        <EmptyState
          icon={<ShieldAlert />}
          titleAm="ፈቃድ የለዎትም"
          hintAm="ይህን ገጽ ለመድረስ አስተዋጽኦ አድራጊ ወይም አስተዳዳሪ መሆን ያስፈልጋል።"
        />
      </div>
    );
  }

  return <>{children}</>;
}
