import type { StockAdjustment } from "@/lib/types";

export const MOCK_STOCK_HISTORY: Record<number, StockAdjustment[]> = {
  12: [
    {
      type: "decrease",
      qty: 6,
      reason: "Spoilage — end of day",
      by: "Marcus Bell",
      when: "Jun 30, 2026 · 21:05",
      result: 18,
    },
    {
      type: "increase",
      qty: 30,
      reason: "Weekly delivery — Sysco",
      by: "Marcus Bell",
      when: "Jun 24, 2026 · 08:20",
      result: 24,
    },
    {
      type: "increase",
      qty: 20,
      reason: "Opening stock count",
      by: "Marcus Bell",
      when: "Jun 17, 2026 · 09:00",
      result: 8,
    },
  ],
  6: [
    {
      type: "decrease",
      qty: 14,
      reason: "Sold out — busy morning",
      by: "Sofia Reyes",
      when: "Jul 5, 2026 · 11:40",
      result: 0,
    },
    {
      type: "increase",
      qty: 14,
      reason: "Weekly delivery — Sysco",
      by: "Marcus Bell",
      when: "Jul 1, 2026 · 08:12",
      result: 14,
    },
  ],
  11: [
    {
      type: "decrease",
      qty: 8,
      reason: "Spoilage — end of day",
      by: "Marcus Bell",
      when: "Jul 2, 2026 · 21:10",
      result: 4,
    },
    {
      type: "increase",
      qty: 12,
      reason: "Weekly delivery — Sysco",
      by: "Marcus Bell",
      when: "Jul 1, 2026 · 08:12",
      result: 12,
    },
  ],
};

export const PRESET_REASONS = [
  "Weekly delivery",
  "Inventory recount",
  "Spoilage / waste",
  "Damaged in transit",
  "Transfer to storage",
];
