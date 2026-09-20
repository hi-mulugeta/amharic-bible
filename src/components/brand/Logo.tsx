import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo.png"; // or src="/logo.png"

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
} as const;

export function Logo({ size = "md", className }: Props) {
  return (
    <img
      src={logoUrl}
      alt="ካተና"
      className={cn(SIZE_CLASS[size], "w-auto object-contain", className)}
    />
  );
}
