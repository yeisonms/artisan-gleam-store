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

export type PosItemType = 'product' | 'custom_service';

export interface PosCartItem {
  id: string; // Para identificar el item (variant.id o un ID generado para servicios)
  type: PosItemType;
  title: string; // variant_name + product_name o custom_service description
  price_cents: number;
  quantity: number;
  subtotal_cents: number;
  variant?: PosProductVariant; // Solo para productos
}

export function usePosCart() {
  const [items, setItems] = useState<PosCartItem[]>([]);

  const addItem = (variant: PosProductVariant) => {
    if (variant.stock <= 0) return; // Validación básica

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === variant.id);
      
      if (existingItem && existingItem.type === 'product') {
        // Incrementar cantidad solo si no excede el stock
        if (existingItem.quantity >= variant.stock) return prevItems;
        
        return prevItems.map((item) =>
          item.id === variant.id
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
            id: variant.id,
            type: 'product',
            title: `${variant.name} - ${variant.variant_name}`,
            price_cents: variant.price_cents,
            quantity: 1,
            subtotal_cents: variant.price_cents,
            variant,
          },
        ];
      }
    });
  };

  const addCustomService = (description: string, price_cents: number) => {
    const serviceId = `service_${Date.now()}`;
    setItems((prevItems) => [
      ...prevItems,
      {
        id: serviceId,
        type: 'custom_service',
        title: description,
        price_cents: price_cents,
        quantity: 1,
        subtotal_cents: price_cents,
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          
          if (item.type === 'product' && item.variant) {
            // Validar que la cantidad sea >= 1 y <= stock disponible para productos
            if (newQuantity < 1 || newQuantity > item.variant.stock) {
              return item;
            }
          } else {
            // Para servicios, simplemente validar >= 1
            if (newQuantity < 1) return item;
          }
          
          return {
            ...item,
            quantity: newQuantity,
            subtotal_cents: newQuantity * item.price_cents,
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
    addCustomService,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
