import { StatusBadge } from "@/components/shared/status-badge";
import { NumericValue } from "@/components/shared/numeric-value";
import { formatUSD } from "@/lib/format-currency";

export function ProductTile({
  name,
  price,
  imageUrl,
  stock,
  onClick,
}: {
  name: string;
  price: number;
  imageUrl?: string;
  stock: "in-stock" | "low-stock" | "out-of-stock";
  onClick?: () => void;
}) {
  const disabled = stock === "out-of-stock";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <span className="font-display text-[15px] font-medium text-primary">
        {name}
      </span>
      <div className="flex items-center justify-between">
        <NumericValue size="md">{formatUSD(price)}</NumericValue>
        <StatusBadge status={stock} />
      </div>
    </button>
  );
}
