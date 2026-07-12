import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-[10px] rounded-xl border border-border bg-card p-5 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-icon-chip-background text-icon-chip-foreground">
        {icon}
      </div>
      <span className="font-display text-[14.5px] font-semibold text-primary">
        {title}
      </span>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
      {action}
    </div>
  );
}
