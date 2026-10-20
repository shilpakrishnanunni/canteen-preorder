import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "canteen-cart-v1";

const readSavedCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readSavedCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart remains usable for the current session if storage is unavailable.
    }
  }, [items]);

  const addItem = useCallback((menuItem) => {
    setItems((current) => {
      const existing = current.find((item) => item.menuItemId === menuItem.id);
      if (existing) {
        return current.map((item) => item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item);
      }
      return [...current, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        description: menuItem.description || "",
        price: Number(menuItem.price) || 0,
        imageUrl: menuItem.imageUrl || null,
        quantity: 1,
      }];
    });
  }, []);

  const setQuantity = useCallback((menuItemId, quantity) => {
    setItems((current) => quantity <= 0
      ? current.filter((item) => item.menuItemId !== menuItemId)
      : current.map((item) => item.menuItemId === menuItemId ? { ...item, quantity } : item));
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((current) => current.filter((item) => item.menuItemId !== menuItemId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const getQuantity = useCallback((menuItemId) => items.find((item) => item.menuItemId === menuItemId)?.quantity || 0, [items]);

  const value = useMemo(() => ({
    items,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    getQuantity,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }), [items, addItem, setQuantity, removeItem, clearCart, getQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
