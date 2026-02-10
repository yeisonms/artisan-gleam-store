import { create } from 'zustand';

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
  attributes: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalCents: () => number;
  itemCount: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: JSON.parse(localStorage.getItem('magna-cart') || '[]'),

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }
      localStorage.setItem('magna-cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeItem: (variantId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.variantId !== variantId);
      localStorage.setItem('magna-cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (variantId, quantity) => {
    set((state) => {
      const newItems = quantity <= 0
        ? state.items.filter((i) => i.variantId !== variantId)
        : state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
      localStorage.setItem('magna-cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('magna-cart');
    set({ items: [] });
  },

  totalCents: () => get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

export const formatCOP = (cents: number) => {
  const pesos = Math.round(cents / 100);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(pesos);
};
