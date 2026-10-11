export const money = (n) => '₹' + Number(n).toFixed(2);

// A stable key for a menu item. Uses `id` when the API returns one.
export const itemKey = (item) => item.id ?? `${item.categoryId}:${item.name}`;

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

export const formatClock = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
}

export const loadFavorites = () => read('canteen:favorites', {});
export const saveFavorites = (v) => write('canteen:favorites', v);

// The orders API only returns { orderToken, status }, so the items, totals and
// status times are kept on this device, keyed by token.
export const loadOrder = (token) => read(`canteen:order:${token}`, null);
export const saveOrder = (order) => write(`canteen:order:${order.orderToken}`, order);
export const loadLastToken = () => read('canteen:lastToken', null);
export const saveLastToken = (t) => write('canteen:lastToken', t);
