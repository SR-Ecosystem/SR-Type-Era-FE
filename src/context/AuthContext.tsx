import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, adminAuthAPI } from "../api/services";

interface UserStats {
  gamesPlayed: number; totalWins: number; bestWpm: number;
  avgWpm: number; avgAccuracy: number;
}
export interface User {
  _id: string; name: string; email: string; stats: UserStats;
}
export interface Admin {
  _id: string; name: string; email: string; role: string;
}

interface AuthCtx {
  user: User | null;
  admin: Admin | null;
  userLoading: boolean;
  adminLoading: boolean;
  loginUser:  (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  logoutUser:  () => void;
  loginAdmin:  (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,         setUser]         = useState<User | null>(null);
  const [admin,        setAdmin]        = useState<Admin | null>(null);
  const [userLoading,  setUserLoading]  = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  // Restore user session
  useEffect(() => {
    const token = localStorage.getItem("srt_token");
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem("srt_token"); localStorage.removeItem("srt_user"); })
        .finally(() => setUserLoading(false));
    } else {
      setUserLoading(false);
    }
  }, []);

  // Restore admin session
  useEffect(() => {
    const token = localStorage.getItem("srt_admin_token");
    if (token) {
      adminAuthAPI.getMe()
        .then(res => setAdmin(res.data.admin))
        .catch(() => { localStorage.removeItem("srt_admin_token"); localStorage.removeItem("srt_admin"); })
        .finally(() => setAdminLoading(false));
    } else {
      setAdminLoading(false);
    }
  }, []);

  const loginUser = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("srt_token", res.data.token);
    setUser(res.data.user);
  };

  const registerUser = async (name: string, email: string, password: string) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem("srt_token", res.data.token);
    setUser(res.data.user);
  };

  const logoutUser = () => {
    localStorage.removeItem("srt_token");
    setUser(null);
  };

  const loginAdmin = async (email: string, password: string) => {
    const res = await adminAuthAPI.login({ email, password });
    localStorage.setItem("srt_admin_token", res.data.token);
    setAdmin(res.data.admin);
  };

  const logoutAdmin = () => {
    localStorage.removeItem("srt_admin_token");
    setAdmin(null);
  };

  const refreshUser = async () => {
    const res = await authAPI.getMe();
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{
      user, admin, userLoading, adminLoading,
      loginUser, registerUser, logoutUser,
      loginAdmin, logoutAdmin, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
