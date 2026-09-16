import { useState } from "react";
import { Plus, Pencil, Sparkles } from "lucide-react";
import { useAllSaints, type SaintOut } from "@/api/queries/liturgy";
import { useDeleteSaint } from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { ETHIOPIAN_MONTHS } from "@/lib/ethiopic-months";

export function AdminSaintsTab() {
  const [page] = useState(1);
  const { data, isLoading, isError } = useAllSaints({ page, perPage: 50 });
  const deleteMutation = useDeleteSaint();

  const saints: SaintOut[] = Array.isArray(data?.data) ? data!.data : [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ቅዱሳንን መጫን አልተቻለም።" />;
  }

  if (saints.length === 0) {
    return (
      <EmptyState
        titleAm="ቅዱስ የለም"
        hintAm="አዲስ ቅዱስ መፍጠር ይችላሉ።"
        action={
          <Button>
            <Plus className="h-4 w-4" />
            አዲስ ቅዱስ
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-border bg-surface-raised/20 text-left">
            <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
              ስም
            </th>
            <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
              የሚታወስበት ቀን
            </th>
            <th className="w-[100px] px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {saints.map((s) => (
            <tr
              key={s.id}
              className="transition-colors hover:bg-surface-raised/10"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <p className="font-amharic text-[15px] text-text-primary">
                    {s.name_am}
                  </p>
                  {s.is_feast && (
                    <span className="inline-flex items-center gap-0.5 rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400">
                      <Sparkles className="h-2.5 w-2.5" />
                      በዓል
                    </span>
                  )}
                </div>
                {s.title_am && (
                  <p className="mt-0.5 font-amharic text-[12px] text-text-muted">
                    {s.title_am}
                  </p>
                )}
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <p className="font-amharic text-[13px] text-text-muted">
                  {ETHIOPIAN_MONTHS[s.ethiopian_month - 1]}{" "}
                  {toEthiopicNumeral(s.ethiopian_day)}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <ConfirmButton
                  onConfirm={() => deleteMutation.mutate(s.id)}
                  busy={deleteMutation.isPending}
                >
                  ሰርዝ
                </ConfirmButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
