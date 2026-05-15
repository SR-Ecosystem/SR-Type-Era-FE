import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Keyboard, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password);
      toast.success("Account created! Welcome!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",     label: "Full Name",        icon: User, type: "text",     placeholder: "John Doe" },
    { key: "email",    label: "Email",             icon: Mail, type: "email",    placeholder: "you@example.com" },
    { key: "password", label: "Password",          icon: Lock, type: "password", placeholder: "••••••••" },
    { key: "confirm",  label: "Confirm Password",  icon: Lock, type: "password", placeholder: "••••••••" },
  ] as const;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 font-mono text-[7px] leading-tight text-slate-900/[.03] overflow-hidden pointer-events-none select-none">
        {Array(300).fill("QWERTYUIOPASDFGHJKLZXCVBNM ").join("")}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="card p-8 w-full max-w-md relative z-10 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl gradient-hero flex items-center justify-center">
            <Keyboard className="h-5 w-5 text-white" />
          </div>
          <div className="text-2xl font-extrabold tracking-tight">Create Account</div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-semibold">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type={type} value={form[key]} onChange={update(key)} required placeholder={placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full gradient-hero text-white rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 shadow-md mt-2"
          >
            {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Register <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
}
