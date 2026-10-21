import axios from "axios";

const TOKEN_KEY = "authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Resolve the request pathname regardless of whether Axios received a relative
 * path (/staff/orders) or an absolute URL. This prevents auth being skipped
 * simply because the URL format changes.
 */
const getRequestPathname = (config) => {
  const requestUrl = config.url || "";
  try {
    const baseUrl = config.baseURL || "http://localhost";
    return new URL(requestUrl, baseUrl).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return requestUrl.split("?")[0].replace(/\/+$/, "") || "/";
  }
};

const isProtectedEndpoint = (pathname) =>
  pathname === "/staff" || pathname.startsWith("/staff/") ||
  pathname === "/admin" || pathname.startsWith("/admin/");

const setHeader = (headers, name, value) => {
  // Axios 1.x uses AxiosHeaders, which exposes .set(). Keep the fallback for
  // plain header objects in tests or other callers.
  if (typeof headers?.set === "function") {
    headers.set(name, value);
  } else if (headers) {
    headers[name] = value;
  }
};

const removeHeader = (headers, name) => {
  if (typeof headers?.delete === "function") {
    headers.delete(name);
  } else if (headers) {
    delete headers[name];
    delete headers[name.toLowerCase()];
  }
};

api.interceptors.request.use((config) => {
  const pathname = getRequestPathname(config);
  const protectedRequest = isProtectedEndpoint(pathname);
  const token = protectedRequest ? localStorage.getItem(TOKEN_KEY) : null;

  config.headers = config.headers || {};

  if (protectedRequest) {
    // Fail clearly instead of silently sending an unauthenticated request to a
    // protected endpoint. The login request itself is not under /staff or /admin.
    if (!token) {
      return Promise.reject(new Error("Your staff session is missing or expired. Please sign in again."));
    }
    setHeader(config.headers, "Authorization", `Bearer ${token}`);
  } else {
    // Student and login endpoints are intentionally unauthenticated.
    removeHeader(config.headers, "Authorization");
  }

  return config;
});

export default api;
