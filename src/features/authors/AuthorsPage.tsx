import { useState } from "react";
import { Users } from "lucide-react";
import { useAuthors, type AuthorOut } from "@/api/queries/authors";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { AuthorCard } from "./AuthorCard";
import { AuthorFilters } from "./AuthorFilters";
import { cn } from "@/lib/utils";

export function AuthorsPage() {
  const [page, setPage] = useState(1);
  const [era, setEra] = useState<string | undefined>(undefined);
  const [ethiopianOnly, setEthiopianOnly] = useState(false);

  const { data, isLoading, isError, isFetching } = useAuthors({
    page,
    era,
    ethiopianVenerated: ethiopianOnly ? true : undefined,
  });

  const handleEraChange = (next: string | undefined) => {
    setEra(next);
    setPage(1);
  };

  const handleEthiopianToggle = (next: boolean) => {
    setEthiopianOnly(next);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-reader px-5 py-10 md:max-w-shell md:px-12 md:py-17 lg:px-20">
      <header className="mb-8">
        <h1 className="font-amharic text-2xl md:text-3xl font-semibold text-text-primary">
          የቤተ ክርስቲያን አበው
        </h1>
        <p className="mt-2 font-amharic text-[14px] text-text-muted max-w-prose">
          የመጀመሪያዎቹ የቤተ ክርስቲያን አባቶች ስለ መጽሐፍ ቅዱስ ያስተማሩትን ያግኙ።
        </p>
      </header>

      <div className="mb-8">
        <AuthorFilters
          era={era}
          ethiopianOnly={ethiopianOnly}
          onEraChange={handleEraChange}
          onEthiopianToggle={handleEthiopianToggle}
        />
      </div>

      {isLoading ? (
        <AuthorsSkeleton />
      ) : isError ? (
        <EmptyState
          icon={<Users />}
          titleAm="ስህተት ተፈጥሯል"
          hintAm="ደራሲያንን መጫን አልተቻለም። እባክዎ ቆይተው ይሞክሩ።"
        />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={<Users />}
          titleAm="ደራሲ አልተገኘም"
          hintAm={
            era || ethiopianOnly
              ? "በዚህ ማጣሪያ ደራሲ አልተገኘም። ማጣሪያውን ያስወግዱ።"
              : "እስካሁን ደራሲ አልተጨመረም።"
          }
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200",
              isFetching ? "opacity-60" : "opacity-100",
            )}
          >
            {data.data.map((author) => (
              <AuthorCard key={author.slug} author={author} />
            ))}
          </div>

          {data.meta.pages > 1 && (
            <div className="mt-10">
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <div className="h-16" />
    </div>
  );
}

function AuthorsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-surface-border bg-surface-raised/20 p-5"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
