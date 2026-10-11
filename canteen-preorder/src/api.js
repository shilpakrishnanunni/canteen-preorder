// In development, use Vite's proxy to avoid browser CORS restrictions.
const BASE = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080');

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...(options?.body ? { headers: { 'Content-Type': 'application/json' } } : {}),
      ...options,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach the API at ${path}. Check that the backend is running on http://localhost:8080, then restart the Vite dev server.`
      );
    }
    throw error;
  }

  if (!res.ok) {
    let message = `Request to ${path} failed (HTTP ${res.status}).`;
    if (res.headers.get('content-type')?.includes('application/json')) {
      const body = await res.json();
      if (typeof body.message === 'string') message = body.message;
    }
    if (res.status === 401 || res.status === 403) {
      message = `The backend denied ${path} (HTTP ${res.status}). Check the backend authentication and authorization rules for this API.`;
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

// GET /menu/categories
export const getCategories = () => request('/menu/categories');

// GET /menu?categorySlug=beverages
export const getMenu = (categorySlug) =>
  request(
    categorySlug
      ? `/menu?categorySlug=${encodeURIComponent(categorySlug)}`
      : '/menu'
  );

// POST /orders   body: { items: [{ menuItemId, quantity }] }
export const createOrder = (items) =>
  request('/orders', { method: 'POST', body: JSON.stringify({ items }) });

// GET /orders/{orderToken}
export const getOrder = (token) =>
  request(`/orders/${encodeURIComponent(token)}`);
