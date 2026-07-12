import { Badge } from "@/components/ui/badge";

type Status =
  | "completed"
  | "voided"
  | "low-stock"
  | "out-of-stock"
  | "in-stock"
  | "active"
  | "inactive";

const statusMap: Record<
  Status,
  { variant: "success" | "warning" | "danger" | "neutral"; label: string }
> = {
  completed: { variant: "success", label: "Completed" },
  voided: { variant: "danger", label: "Voided" },
  "low-stock": { variant: "warning", label: "Low stock" },
  "out-of-stock": { variant: "danger", label: "Out of stock" },
  "in-stock": { variant: "success", label: "In stock" },
  active: { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { variant, label } = statusMap[status];

  return <Badge variant={variant}>{label}</Badge>;
}
