import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import LandingPage       from "./pages/LandingPage";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import Game              from "./pages/Game";
import Result            from "./pages/Result";
import AdminLogin        from "./pages/admin/AdminLogin";
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AdminCompetitions from "./pages/admin/AdminCompetitions";
import AdminResults      from "./pages/admin/AdminResults";
import NotFound          from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/game"      element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/result"    element={<ProtectedRoute><Result /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/login"        element={<AdminLogin />} />
          <Route path="/admin/dashboard"    element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/competitions" element={<AdminRoute><AdminCompetitions /></AdminRoute>} />
          <Route path="/admin/results"      element={<AdminRoute><AdminResults /></AdminRoute>} />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*"      element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
