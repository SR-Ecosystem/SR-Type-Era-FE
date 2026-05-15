import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl font-extrabold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8">Looks like this page went on a typing break.</p>
        <Link to="/" className="inline-flex items-center gap-2 gradient-hero text-white rounded-xl px-6 py-3 font-bold hover:opacity-90 transition-opacity">
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
