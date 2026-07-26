export type DashboardPeriod = "today" | "week" | "month";

export type StatDelta = {
  text: string;
  up: boolean;
};

export type DashboardSnapshot = {
  dateLabel: string;
  chartTitle: string;
  chartMeta: string;
  deltaNote: string;
  stats: {
    sales: string;
    txns: string;
    avg: string;
    items: string;
  };
  deltas: {
    sales: StatDelta;
    txns: StatDelta;
    avg: StatDelta;
    items: StatDelta;
  };
  bars: { label: string; value: number }[];
  bestSellers: { name: string; category: string; qty: number }[];
  categoryBreakdown: { name: string; percent: number; color: string }[];
};

export const MOCK_DASHBOARD: Record<DashboardPeriod, DashboardSnapshot> = {
  today: {
    dateLabel: "Jul 8, 2026",
    chartTitle: "Sales by hour",
    chartMeta: "96 orders today",
    deltaNote: "vs yesterday",
    stats: { sales: "$1,284.50", txns: "96", avg: "$13.38", items: "214" },
    deltas: {
      sales: { text: "↑ 12.4%", up: true },
      txns: { text: "↑ 8", up: true },
      avg: { text: "↓ 2.1%", up: false },
      items: { text: "↑ 15", up: true },
    },
    bars: [
      { label: "7a", value: 62 },
      { label: "8a", value: 118 },
      { label: "9a", value: 175 },
      { label: "10a", value: 210 },
      { label: "11a", value: 168 },
      { label: "12p", value: 142 },
      { label: "1p", value: 196 },
      { label: "2p", value: 150 },
      { label: "3p", value: 96 },
      { label: "4p", value: 74 },
      { label: "5p", value: 88 },
      { label: "6p", value: 110 },
      { label: "7p", value: 64 },
      { label: "8p", value: 41 },
    ],
    bestSellers: [
      { name: "Caffè Latte", category: "Espresso", qty: 42 },
      { name: "Cappuccino", category: "Espresso", qty: 38 },
      { name: "Butter Croissant", category: "Pastry", qty: 31 },
      { name: "Cold Brew", category: "Brewed Coffee", qty: 27 },
      { name: "Americano", category: "Espresso", qty: 24 },
    ],
    categoryBreakdown: [
      { name: "Espresso", percent: 44, color: "#2B3A4A" },
      { name: "Brewed Coffee", percent: 22, color: "#4A7DBD" },
      { name: "Pastry", percent: 18, color: "#B08D57" },
      { name: "Non-Coffee", percent: 11, color: "#4C8C5B" },
      { name: "Retail Beans", percent: 5, color: "#9DB4CE" },
    ],
  },
  week: {
    dateLabel: "Jul 2 – Jul 8, 2026",
    chartTitle: "Sales by day",
    chartMeta: "684 orders this week",
    deltaNote: "vs last week",
    stats: { sales: "$9,142.75", txns: "684", avg: "$13.37", items: "1,508" },
    deltas: {
      sales: { text: "↑ 6.8%", up: true },
      txns: { text: "↑ 41", up: true },
      avg: { text: "↑ 0.4%", up: true },
      items: { text: "↑ 96", up: true },
    },
    bars: [
      { label: "Wed", value: 1180 },
      { label: "Thu", value: 1284 },
      { label: "Fri", value: 1520 },
      { label: "Sat", value: 1740 },
      { label: "Sun", value: 1610 },
      { label: "Mon", value: 1024 },
      { label: "Tue", value: 784 },
    ],
    bestSellers: [
      { name: "Caffè Latte", category: "Espresso", qty: 268 },
      { name: "Cappuccino", category: "Espresso", qty: 241 },
      { name: "Butter Croissant", category: "Pastry", qty: 198 },
      { name: "Cold Brew", category: "Brewed Coffee", qty: 172 },
      { name: "Americano", category: "Espresso", qty: 156 },
    ],
    categoryBreakdown: [
      { name: "Espresso", percent: 41, color: "#2B3A4A" },
      { name: "Brewed Coffee", percent: 24, color: "#4A7DBD" },
      { name: "Pastry", percent: 19, color: "#B08D57" },
      { name: "Non-Coffee", percent: 10, color: "#4C8C5B" },
      { name: "Retail Beans", percent: 6, color: "#9DB4CE" },
    ],
  },
  month: {
    dateLabel: "Jun 9 – Jul 8, 2026",
    chartTitle: "Sales by day",
    chartMeta: "2,940 orders in 30 days",
    deltaNote: "vs prev. 30 days",
    stats: {
      sales: "$38,610.00",
      txns: "2,940",
      avg: "$13.13",
      items: "6,472",
    },
    deltas: {
      sales: { text: "↑ 9.1%", up: true },
      txns: { text: "↑ 214", up: true },
      avg: { text: "↓ 1.2%", up: false },
      items: { text: "↑ 402", up: true },
    },
    bars: [
      { label: "W1", value: 8240 },
      { label: "W2", value: 9010 },
      { label: "W3", value: 9560 },
      { label: "W4", value: 8720 },
      { label: "W5", value: 3080 },
    ],
    bestSellers: [
      { name: "Caffè Latte", category: "Espresso", qty: 1140 },
      { name: "Cappuccino", category: "Espresso", qty: 1026 },
      { name: "Butter Croissant", category: "Pastry", qty: 842 },
      { name: "Cold Brew", category: "Brewed Coffee", qty: 731 },
      { name: "Americano", category: "Espresso", qty: 664 },
    ],
    categoryBreakdown: [
      { name: "Espresso", percent: 43, color: "#2B3A4A" },
      { name: "Brewed Coffee", percent: 23, color: "#4A7DBD" },
      { name: "Pastry", percent: 18, color: "#B08D57" },
      { name: "Non-Coffee", percent: 10, color: "#4C8C5B" },
      { name: "Retail Beans", percent: 6, color: "#9DB4CE" },
    ],
  },
};
