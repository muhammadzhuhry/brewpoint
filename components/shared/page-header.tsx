import type { ReactNode } from "react";

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-display text-[22px] leading-7 font-semibold text-primary">
        {title}
      </h1>
      {action}
    </div>
  );
}
