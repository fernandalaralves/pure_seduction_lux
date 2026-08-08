import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'psl_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// A cart line is uniquely identified by product id + selected size, so the
// same product in two different sizes shows up as two separate lines.
function lineKey(item) {
  return `${item.productId}::${item.selectedSize || ''}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, { quantity = 1, selectedSize = null } = {}) => {
    setItems((prev) => {
      const newItem = {
        productId: product.id,
        name: product.name,
        variantDescription: product.variant_description,
        color: product.color,
        price: parseFloat(product.price),
        image: product.cover_image_url || product.images?.[0]?.url || null,
        selectedSize,
        quantity,
      };
      const key = lineKey(newItem);
      const existingIndex = prev.findIndex((i) => lineKey(i) === key);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], quantity: copy[existingIndex].quantity + quantity };
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (item, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (lineKey(i) === lineKey(item) ? { ...i, quantity } : i))
    );
  };

  const removeItem = (item) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(item)));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const totalQuantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return ctx;
}
