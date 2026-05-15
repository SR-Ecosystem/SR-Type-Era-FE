import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Keyboard, LayoutDashboard, Gamepad2, Trophy, BarChart3, LogOut, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps { isAdmin?: boolean; }

export default function Navbar({ isAdmin = false }: NavbarProps) {
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
  const location = useLocation();

  const userLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/game",      label: "Compete",   icon: Gamepad2 },
  ];
  const adminLinks = [
    { to: "/admin/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
    { to: "/admin/competitions", label: "Competitions", icon: Trophy },
    { to: "/admin/results",      label: "Results",      icon: BarChart3 },
  ];
  const links = isAdmin ? adminLinks : userLinks;
  const name  = isAdmin ? admin?.name : user?.name;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SRTypeEra Logo" className="h-9 w-9 object-contain rounded-full" />
          <span className="text-lg font-extrabold tracking-tight">
            SRTypeEra
            {isAdmin && (
              <span className="ml-2 text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
                {active && (
                  <motion.div layoutId={`nav-ind-${isAdmin ? "admin" : "user"}`}
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", duration: 0.3 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {isAdmin && <Shield className="h-4 w-4 text-teal-600" />}
          <span className="text-sm text-slate-500 font-medium hidden sm:block">{name}</span>
          <button
            onClick={isAdmin ? logoutAdmin : logoutUser}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
