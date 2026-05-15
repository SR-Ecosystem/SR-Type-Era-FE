import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoLoader from "./LogoLoader";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, userLoading } = useAuth();
  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><LogoLoader /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { admin, adminLoading } = useAuth();
  if (adminLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><LogoLoader /></div>;
  return admin ? children : <Navigate to="/admin/login" replace />;
}
