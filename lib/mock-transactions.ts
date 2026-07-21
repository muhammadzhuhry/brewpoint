import type { Transaction } from "@/lib/types";

export const CASHIERS = ["All cashiers", "Sofia Reyes", "Daniel Okafor"];

export const VOID_REASONS = [
  "Wrong item rung up",
  "Customer changed mind",
  "Duplicate charge",
  "Cashier error",
  "Refund issued",
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-2041",
    time: "Jul 8, 2026 · 09:14 AM",
    cashier: "Sofia Reyes",
    status: "completed",
    method: "Cash",
    received: 20.0,
    items: [
      { name: "Caffè Latte", qty: 2, price: 4.75 },
      { name: "Butter Croissant", qty: 1, price: 3.75 },
    ],
  },
  {
    id: "TX-2040",
    time: "Jul 8, 2026 · 09:02 AM",
    cashier: "Sofia Reyes",
    status: "completed",
    method: "Cash",
    received: 10.0,
    items: [
      { name: "Americano", qty: 1, price: 3.5 },
      { name: "Blueberry Muffin", qty: 1, price: 3.95 },
    ],
  },
  {
    id: "TX-2039",
    time: "Jul 8, 2026 · 08:47 AM",
    cashier: "Daniel Okafor",
    status: "completed",
    method: "Cash",
    received: 30.0,
    items: [
      { name: "Cold Brew", qty: 2, price: 4.95 },
      { name: "Nitro Cold Brew", qty: 1, price: 5.75 },
      { name: "Almond Croissant", qty: 1, price: 4.5 },
    ],
  },
  {
    id: "TX-2038",
    time: "Jul 8, 2026 · 08:31 AM",
    cashier: "Daniel Okafor",
    status: "voided",
    method: "Cash",
    received: 15.0,
    items: [
      { name: "Matcha Latte", qty: 1, price: 5.25 },
      { name: "Chai Latte", qty: 1, price: 4.75 },
    ],
    voidReason: "Wrong item rung up",
    voidBy: "Marcus Bell",
  },
  {
    id: "TX-2037",
    time: "Jul 8, 2026 · 08:19 AM",
    cashier: "Sofia Reyes",
    status: "completed",
    method: "Cash",
    received: 12.0,
    items: [
      { name: "Cappuccino", qty: 1, price: 4.25 },
      { name: "Flat White", qty: 1, price: 4.5 },
    ],
  },
  {
    id: "TX-2036",
    time: "Jul 8, 2026 · 08:05 AM",
    cashier: "Daniel Okafor",
    status: "completed",
    method: "Cash",
    received: 6.0,
    items: [{ name: "Cortado", qty: 1, price: 4.0 }],
  },
  {
    id: "TX-2035",
    time: "Jul 7, 2026 · 06:52 PM",
    cashier: "Sofia Reyes",
    status: "completed",
    method: "Cash",
    received: 50.0,
    items: [
      { name: "House Blend 12oz", qty: 2, price: 16.0 },
      { name: "Cappuccino", qty: 1, price: 4.25 },
    ],
  },
  {
    id: "TX-2034",
    time: "Jul 7, 2026 · 05:38 PM",
    cashier: "Daniel Okafor",
    status: "completed",
    method: "Cash",
    received: 20.0,
    items: [
      { name: "Pour Over", qty: 1, price: 5.5 },
      { name: "Cinnamon Roll", qty: 1, price: 4.25 },
      { name: "Americano", qty: 2, price: 3.5 },
    ],
  },
  {
    id: "TX-2033",
    time: "Jul 7, 2026 · 04:11 PM",
    cashier: "Sofia Reyes",
    status: "voided",
    method: "Cash",
    received: 10.0,
    items: [{ name: "Hot Chocolate", qty: 2, price: 4.25 }],
    voidReason: "Customer changed mind",
    voidBy: "Marcus Bell",
  },
  {
    id: "TX-2032",
    time: "Jul 7, 2026 · 03:47 PM",
    cashier: "Daniel Okafor",
    status: "completed",
    method: "Cash",
    received: 15.0,
    items: [
      { name: "Chai Latte", qty: 1, price: 4.75 },
      { name: "Almond Croissant", qty: 2, price: 4.5 },
    ],
  },
];
