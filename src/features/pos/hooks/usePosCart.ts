import { useState, useMemo } from 'react';

export interface PosProductVariant {
  id: string; // ID de la variante
  product_id: string;
  name: string; // Nombre del producto padre
  variant_name: string; // Nombre de la variante
  sku: string | null;
  price_cents: number;
  stock: number;
  image_url?: string | null;
}

export interface PosCartItem {
  variant: PosProductVariant;
  quantity: number;
  subtotal_cents: number;
}

export function usePosCart() {
  const [items, setItems] = useState<PosCartItem[]>([]);

  const addItem = (variant: PosProductVariant) => {
    if (variant.stock <= 0) return; // Validación básica

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.variant.id === variant.id);
      
      if (existingItem) {
        // Incrementar cantidad solo si no excede el stock
        if (existingItem.quantity >= variant.stock) return prevItems;
        
        return prevItems.map((item) =>
          item.variant.id === variant.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal_cents: (item.quantity + 1) * variant.price_cents,
              }
            : item
        );
      } else {
        // Añadir nuevo ítem
        return [
          ...prevItems,
          {
            variant,
            quantity: 1,
            subtotal_cents: variant.price_cents,
          },
        ];
      }
    });
  };

  const removeItem = (variantId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.variant.id === variantId) {
          const newQuantity = item.quantity + delta;
          // Validar que la cantidad sea >= 1 y <= stock disponible
          if (newQuantity < 1 || newQuantity > item.variant.stock) {
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            subtotal_cents: newQuantity * item.variant.price_cents,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCents = useMemo(() => {
    return items.reduce((acc, item) => acc + item.subtotal_cents, 0);
  }, [items]);

  return {
    items,
    totalCents,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
