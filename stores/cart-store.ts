import { create } from "zustand";

type CartState = {
  quantities: Record<number, number>;
  order: number[];
  addItem: (productId: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  quantities: {},
  order: [],

  addItem: (productId) => {
    const { quantities, order } = get();
    set({
      quantities: {
        ...quantities,
        [productId]: (quantities[productId] ?? 0) + 1,
      },
      order: order.includes(productId) ? order : [...order, productId],
    });
  },

  increment: (productId) => {
    const { quantities } = get();
    set({
      quantities: {
        ...quantities,
        [productId]: (quantities[productId] ?? 0) + 1,
      },
    });
  },

  decrement: (productId) => {
    const { quantities, order } = get();
    const next = (quantities[productId] ?? 0) - 1;
    if (next <= 0) {
      const updated = { ...quantities };
      delete updated[productId];
      set({
        quantities: updated,
        order: order.filter((id) => id !== productId),
      });
    } else {
      set({ quantities: { ...quantities, [productId]: next } });
    }
  },

  removeItem: (productId) => {
    const { quantities, order } = get();
    const updated = { ...quantities };
    delete updated[productId];
    set({ quantities: updated, order: order.filter((id) => id !== productId) });
  },

  clearCart: () => set({ quantities: {}, order: [] }),
}));
