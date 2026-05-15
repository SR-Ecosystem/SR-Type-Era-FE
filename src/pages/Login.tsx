import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Keyboard, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await loginUser(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG texture */}
      <div className="absolute inset-0 font-mono text-[7px] leading-tight text-slate-900/[.03] overflow-hidden pointer-events-none select-none">
        {Array(300).fill("QWERTYUIOPASDFGHJKLZXCVBNM ").join("")}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="card p-8 w-full max-w-md relative z-10 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl gradient-hero flex items-center justify-center">
            <Keyboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight">SRTypeEra</div>
            <div className="text-xs text-slate-400">Precision under pressure.</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full gradient-hero text-white rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity shadow-md mt-2"
          >
            {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Log In <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">
          <Link to="/admin/login" className="hover:text-slate-600 transition-colors">Admin Login →</Link>
        </p>
      </motion.div>
    </div>
  );
}
