import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MAX_PER_ITEM } from './config.js';
import {
  itemKey,
  loadFavorites,
  loadLastToken,
  saveFavorites,
  saveLastToken,
} from './utils.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // { [itemKey]: { item, qty } }
  const [cart, setCart] = useState({});
  const [favorites, setFavorites] = useState(loadFavorites);
  const [limitItem, setLimitItem] = useState(null); // item that hit the limit
  const [lastToken, setLastTokenState] = useState(loadLastToken);

  const add = useCallback((item) => {
    const key = itemKey(item);
    setCart((prev) => {
      const qty = prev[key]?.qty ?? 0;
      if (qty >= MAX_PER_ITEM) {
        setLimitItem(item);
        return prev;
      }
      return { ...prev, [key]: { item, qty: qty + 1 } };
    });
  }, []);

  const remove = useCallback((item) => {
    const key = itemKey(item);
    setCart((prev) => {
      const qty = prev[key]?.qty ?? 0;
      if (qty <= 1) {
        const { [key]: _gone, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { item, qty: qty - 1 } };
    });
  }, []);

  const clear = useCallback(() => setCart({}), []);

  const toggleFavorite = useCallback((item) => {
    const key = itemKey(item);
    setFavorites((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) delete next[key];
      saveFavorites(next);
      return next;
    });
  }, []);

  const setLastToken = useCallback((token) => {
    saveLastToken(token);
    setLastTokenState(token);
  }, []);

  const value = useMemo(() => {
    const lines = Object.values(cart);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
    return {
      cart,
      lines,
      count,
      total,
      add,
      remove,
      clear,
      favorites,
      toggleFavorite,
      limitItem,
      closeLimit: () => setLimitItem(null),
      lastToken,
      setLastToken,
    };
  }, [cart, add, remove, clear, favorites, toggleFavorite, limitItem, lastToken, setLastToken]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
