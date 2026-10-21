import React, { createContext, useEffect, useState, useContext } from "react";
import { logisticsApi } from "../services/logisticsApi";

const AuthContext = createContext({
  user: null,
  loading: false,
  authError: "",
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("ydhm_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("ydhm_api_token")) return;

    logisticsApi.me()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem("ydhm_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem("ydhm_api_token");
        localStorage.removeItem("ydhm_user");
        setUser(null);
      });
  }, []);

  const persistSession = (session) => {
    localStorage.setItem("ydhm_api_token", session.token);
    localStorage.setItem("ydhm_user", JSON.stringify(session.user));
    setUser(session.user);
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    setAuthError("");
    try {
      const session = await logisticsApi.login(email, password);
      persistSession(session);
      return session.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, role, company }) => {
    setLoading(true);
    setAuthError("");
    try {
      const session = await logisticsApi.register({ name, email, password, role, company });
      persistSession(session);
      return session.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("ydhm_api_token");
    localStorage.removeItem("ydhm_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export default AuthContext;
