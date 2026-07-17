import type { ReactNode } from "react";

export function PageHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: string;
  action?: ReactNode;
}) {
  return (
    <div className="-mx-6 -mt-6 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-[22px] leading-7 font-semibold text-primary">
          {title}
        </h1>
        {count && (
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
