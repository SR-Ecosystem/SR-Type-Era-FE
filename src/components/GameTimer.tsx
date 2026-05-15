import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";

interface Props { duration: number; isRunning: boolean; onComplete?: () => void; }

export default function GameTimer({ duration, isRunning, onComplete }: Props) {
  const [left, setLeft] = useState(duration);

  useEffect(() => { setLeft(duration); }, [duration]);

  useEffect(() => {
    if (!isRunning || left <= 0) return;
    const id = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { onComplete?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, left, onComplete]); // eslint-disable-line

  const m    = Math.floor(left / 60);
  const s    = left % 60;
  const pct  = (left / duration) * 100;
  const isLow = left <= 10;

  return (
    <div className="card flex items-center gap-3 px-4 py-2.5">
      <Timer className={`h-5 w-5 ${isLow ? "text-red-500 animate-pulse" : "text-primary-light"}`} />
      <div className="min-w-[90px]">
        <div className={`font-mono text-2xl font-bold ${isLow ? "text-red-500" : "text-slate-900"}`}>
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
          <motion.div
            className={`h-full rounded-full ${isLow ? "bg-red-500" : "gradient-hero"}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
