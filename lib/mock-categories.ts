import type { Category } from "@/lib/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Espresso",
    productCount: 8,
    sampleProducts: ["Cappuccino", "Caffè Latte", "Flat White", "Americano"],
  },
  {
    id: 2,
    name: "Brewed Coffee",
    productCount: 4,
    sampleProducts: ["Cold Brew", "Pour Over"],
  },
  {
    id: 3,
    name: "Non-Coffee",
    productCount: 5,
    sampleProducts: ["Matcha Latte", "Chai Latte"],
  },
  {
    id: 4,
    name: "Pastry",
    productCount: 6,
    sampleProducts: ["Butter Croissant", "Blueberry Muffin"],
  },
  { id: 5, name: "Seasonal Drinks", productCount: 0, sampleProducts: [] },
];
