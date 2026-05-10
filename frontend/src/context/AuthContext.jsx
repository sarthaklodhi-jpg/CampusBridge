import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/endpoints";
import { setAccessToken } from "../api/client";

const AuthContext = createContext(null);
const AuthStateContext = createContext(null);
const AuthUserContext = createContext(null);
const AuthActionsContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccessToken(token);
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  }, [token]);

  const refreshMe = useCallback(async () => {
    const { data } = await authApi.me();
    setUser(data.data.user);
    return data.data.user;
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshMe();
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [refreshMe, token]);

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload);
    setToken(data.data.accessToken);
    setUser(data.data.user);
    toast.success("Welcome back");
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    setToken(data.data.accessToken);
    setUser(data.data.user);
    toast.success("Your campus account is ready");
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const stateValue = useMemo(
    () => ({ token, loading, isAuthenticated: Boolean(user) }),
    [token, loading, user]
  );

  const userValue = useMemo(() => ({ user, setUser, refreshMe }), [user, refreshMe]);
  const actionsValue = useMemo(() => ({ login, register, logout }), [login, register, logout]);

  const value = useMemo(
    () => ({ ...stateValue, ...userValue, ...actionsValue }),
    [stateValue, userValue, actionsValue]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthUserContext.Provider value={userValue}>
        <AuthActionsContext.Provider value={actionsValue}>
          <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
        </AuthActionsContext.Provider>
      </AuthUserContext.Provider>
    </AuthStateContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useAuthState = () => useContext(AuthStateContext);
export const useAuthUser = () => useContext(AuthUserContext);
export const useAuthActions = () => useContext(AuthActionsContext);
