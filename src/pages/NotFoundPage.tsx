import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-reader px-6 py-24">
      <EmptyState
        icon={<Compass />}
        titleAm="ገጹ አልተገኘም"
        titleEn="Page not found"
        hintAm="የፈለጉት ገጽ አልተገኘም።"
        action={
          <Link to="/">
            <Button variant="primary">ወደ መነሻ ተመለስ</Button>
          </Link>
        }
      />
    </div>
  );
}
