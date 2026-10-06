import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "@/services/authService";
import {
  clearToken,
  getToken,
  setToken as storeToken,
} from "@/services/apiClient";

const AuthContext = createContext(null);
const USER_KEY = "laundry_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [token, setTokenState] = useState(() => getToken());
  const [loadingAuth, setLoadingAuth] = useState(() => !!getToken());

  const persistSession = useCallback((data) => {
    storeToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setLoadingAuth(false);
      return null;
    }
    setLoadingAuth(true);
    try {
      const res = await authService.getMe();
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      return res.user;
    } catch {
      clearToken();
      setTokenState(null);
      setUser(null);
      return null;
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) refreshUser();
    else setLoadingAuth(false);
  }, [refreshUser]);

  const login = useCallback(
    async (email, password) => {
      const res = await authService.login({ email, password });
      persistSession(res);
      return res.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (data) => {
      const res = await authService.register(data);
      persistSession(res);
      return res.user;
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loadingAuth,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
