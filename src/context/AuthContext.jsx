import { createContext, useContext, useMemo, useState } from "react";
import { authApi, staffAuthApi } from "../api/api";
import { clearSession, getSession, saveSession } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSession());

  const login = async credentials => {
    const data = await authApi.login(credentials);
    let merged = data;
    // Staff sessions also carry their assigned zone, which every staff
    // page needs to scope its API calls - fetch it once at login time so
    // it's cached in the session instead of re-fetched on every page.
    if (data.role === "ROLE_STAFF") {
      try {
        const profile = await staffAuthApi.profile();
        merged = { ...data, assignedZone: profile.assignedZone, status: profile.status };
      } catch {
        // Profile fetch failing shouldn't block login itself; zone-scoped
        // pages will surface the error when they try to load data.
      }
    }
    saveSession(merged);
    setSession(merged);
    return merged;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clearSession();
    setSession(null);
  };

  const value = useMemo(() => ({
    session,
    isAuthenticated: !!session?.token,
    isAdmin: session?.role === "ROLE_ADMIN",
    isStaff: session?.role === "ROLE_STAFF",
    assignedZone: session?.assignedZone || null,
    login, logout
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
