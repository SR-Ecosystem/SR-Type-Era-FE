import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string; value: string | number;
  icon: LucideIcon; trend?: string; delay?: number; color?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, delay = 0, color = "text-primary-light" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.2, 0, 0, 1] }}
      className="card p-5 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-mono text-3xl font-bold text-slate-900">{value}</span>
        {trend && <span className="text-xs font-bold text-emerald-500 mb-1">{trend}</span>}
      </div>
    </motion.div>
  );
}
