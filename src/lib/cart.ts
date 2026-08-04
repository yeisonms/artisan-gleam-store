import { create } from 'zustand';
import { z } from 'zod';

const CartItemSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1).max(200),
  variantName: z.string().min(1).max(100),
  imageUrl: z.string().max(2000),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(100),
  attributes: z.record(z.string()),
});

const CartSchema = z.array(CartItemSchema);

export type CartItem = z.infer<typeof CartItemSchema>;

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalCents: () => number;
  itemCount: () => number;
}

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem('memories-cart');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    const validated = CartSchema.safeParse(parsed);
    return validated.success ? validated.data : [];
  } catch {
    return [];
  }
}

export const useCart = create<CartState>((set, get) => ({
  items: loadCartFromStorage(),

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
      localStorage.setItem('memories-cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeItem: (variantId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.variantId !== variantId);
      localStorage.setItem('memories-cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (variantId, quantity) => {
    set((state) => {
      const newItems = quantity <= 0
        ? state.items.filter((i) => i.variantId !== variantId)
        : state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
      localStorage.setItem('memories-cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('memories-cart');
    set({ items: [] });
  },

  totalCents: () => get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

export const formatCOP = (cents: number) => {
  const pesos = Math.round(cents / 100);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(pesos);
};
