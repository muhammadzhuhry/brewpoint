import { cn } from "@/lib/utils";

export function NumericValue({
  children,
  size = "md",
  className,
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "tabular-nums",
        size === "lg"
          ? "text-[20px] leading-[28px] font-semibold"
          : "text-sm leading-5 font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
