import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "canteen-cart-v1";

const readSavedCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item) => item && item.menuItemId != null && Number(item.quantity) > 0)
      .map((item) => ({
        ...item,
        menuItemId: item.menuItemId,
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        price: Math.max(0, Number(item.price) || 0),
        available: item.available !== false,
      }));
  } catch {
    return [];
  }
};

const normaliseId = (id) => String(id);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readSavedCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart remains usable for this session if browser storage is unavailable.
    }
  }, [items]);

  const addItem = useCallback((menuItem) => {
    setItems((current) => {
      const existing = current.find((item) => normaliseId(item.menuItemId) === normaliseId(menuItem.id));
      if (existing) {
        return current.map((item) => normaliseId(item.menuItemId) === normaliseId(menuItem.id)
          ? { ...item, quantity: item.quantity + 1, available: true }
          : item);
      }
      return [...current, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        description: menuItem.description || "",
        price: Math.max(0, Number(menuItem.price) || 0),
        imageUrl: menuItem.imageUrl || null,
        categoryName: menuItem.categoryName || "",
        quantity: 1,
        available: true,
      }];
    });
  }, []);

  const setQuantity = useCallback((menuItemId, quantity) => {
    const safeQuantity = Math.floor(Number(quantity) || 0);
    setItems((current) => safeQuantity <= 0
      ? current.filter((item) => normaliseId(item.menuItemId) !== normaliseId(menuItemId))
      : current.map((item) => normaliseId(item.menuItemId) === normaliseId(menuItemId)
        ? { ...item, quantity: safeQuantity }
        : item));
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((current) => current.filter((item) => normaliseId(item.menuItemId) !== normaliseId(menuItemId)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQuantity = useCallback((menuItemId) => (
    items.find((item) => normaliseId(item.menuItemId) === normaliseId(menuItemId))?.quantity || 0
  ), [items]);

  // Refresh cart snapshots against the public menu. Items missing from that response
  // are retained for visibility but marked unavailable so the student can remove them.
  const reconcileWithMenu = useCallback((menuItems) => {
    const menuById = new Map((Array.isArray(menuItems) ? menuItems : []).map((item) => [normaliseId(item.id), item]));
    const priceChanges = [];
    const unavailableIds = [];

    const nextItems = items.map((cartItem) => {
      const currentMenuItem = menuById.get(normaliseId(cartItem.menuItemId));
      if (!currentMenuItem) {
        unavailableIds.push(cartItem.menuItemId);
        return { ...cartItem, available: false };
      }

      const currentPrice = Math.max(0, Number(currentMenuItem.price) || 0);
      if (Math.abs(currentPrice - Number(cartItem.price)) > 0.001) {
        priceChanges.push({
          menuItemId: cartItem.menuItemId,
          name: currentMenuItem.name || cartItem.name,
          previousPrice: Number(cartItem.price) || 0,
          currentPrice,
        });
      }

      return {
        ...cartItem,
        name: currentMenuItem.name || cartItem.name,
        description: currentMenuItem.description || "",
        price: currentPrice,
        imageUrl: currentMenuItem.imageUrl || null,
        categoryName: currentMenuItem.categoryName || cartItem.categoryName || "",
        available: currentMenuItem.available !== false,
      };
    });

    setItems(nextItems);
    return { priceChanges, unavailableIds };
  }, [items]);

  const value = useMemo(() => ({
    items,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    getQuantity,
    reconcileWithMenu,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    unavailableItems: items.filter((item) => item.available === false),
  }), [items, addItem, setQuantity, removeItem, clearCart, getQuantity, reconcileWithMenu]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
