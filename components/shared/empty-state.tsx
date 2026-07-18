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
    <div className="flex flex-col items-center gap-[10px] rounded-xl p-5 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-icon-chip-background text-icon-chip-foreground">
        {icon}
      </div>
      <span className="font-display text-lg font-semibold text-primary">
        {title}
      </span>
      {description && (
        <span className="max-w-[340px] text-xs text-muted-foreground">
          {description}
        </span>
      )}

      {action}
    </div>
  );
}
