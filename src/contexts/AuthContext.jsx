import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { loginRequest } from "../api/auth.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "authToken";

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(decodeURIComponent(
      Array.from(decoded, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
    ));
  } catch {
    return null;
  }
};

const getValidSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const claims = decodeJwtPayload(token);
  const expired = claims?.exp && claims.exp * 1000 <= Date.now();
  const role = claims?.role;

  if (!claims || expired || !["STAFF", "ADMIN"].includes(role)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  return { token, role, userId: claims.sub };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getValidSession());

  const login = useCallback(async ({ email, password }) => {
    const data = await loginRequest({ email, password });
    if (!data?.token) {
      throw new Error("The login response did not include an authentication token.");
    }

    const claims = decodeJwtPayload(data.token);
    const expired = claims?.exp && claims.exp * 1000 <= Date.now();
    if (!claims || expired) {
      throw new Error("The server returned an invalid or expired token.");
    }

    if (!["STAFF", "ADMIN"].includes(claims.role)) {
      throw new Error("This login is for canteen staff and administrators only.");
    }

    const nextSession = { token: data.token, role: claims.role, userId: claims.sub };
    localStorage.setItem(TOKEN_KEY, data.token);
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session,
    role: session?.role ?? null,
    isAuthenticated: Boolean(session),
    login,
    logout,
  }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
};
