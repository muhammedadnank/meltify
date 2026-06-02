import { createContext, useContext, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Auto load user if token exists
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      axios
        .get("auth/profile/")
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, []);
  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    const refresh = localStorage.getItem("refresh");
    if (refresh) {
      axios.post("auth/logout/", { refresh }).catch(() => {});
    }
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
