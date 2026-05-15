import { motion } from "framer-motion";
import { Player } from "../hooks/useSocket";

interface Props { players: Player[]; }

const CONFIG = [
  { rank: 2, height: "h-24", color: "text-slate-400",  bg: "bg-slate-100",   medal: "🥈", delay: 0.2 },
  { rank: 1, height: "h-32", color: "text-yellow-500", bg: "bg-primary/10",  medal: "🥇", delay: 0   },
  { rank: 3, height: "h-20", color: "text-amber-600",  bg: "bg-amber-50",    medal: "🥉", delay: 0.4 },
];

export default function Podium({ players }: Props) {
  const sorted  = [...players].sort((a, b) => b.wpm - a.wpm).slice(0, 3);
  const ordered = [sorted[1], sorted[0], sorted[2]]; // 2nd, 1st, 3rd display order

  return (
    <div className="flex items-end justify-center gap-4 py-8 relative">
      {/* Background Star Appreciation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="absolute -top-4 text-4xl text-yellow-400 opacity-20 blur-sm">
        ✨
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute right-1/4 top-0 text-3xl text-primary opacity-30 blur-sm">
        ✨
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute left-1/4 top-4 text-2xl text-amber-400 opacity-40 blur-sm">
        ✨
      </motion.div>

      {ordered.map((player, i) => {
        const cfg = CONFIG[i];
        if (!player) return <div key={i} className={`w-24 ${cfg.height}`} />;
        return (
          <motion.div
            key={player.userId}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: cfg.delay, type: "spring", stiffness: 100, damping: 12 }}
            className="flex flex-col items-center gap-2 relative group"
          >
            {cfg.rank === 1 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute -top-8 text-2xl"
              >
                ✨
              </motion.span>
            )}
            <span className="text-3xl filter drop-shadow-md">{cfg.medal}</span>
            <span className="text-sm font-bold max-w-[96px] text-center truncate">{player.userName}</span>
            <span className={`font-mono font-bold text-sm ${cfg.color}`}>{player.wpm} WPM</span>
            <div className={`${cfg.height} w-24 rounded-t-xl ${cfg.bg} border border-slate-200 flex items-center justify-center relative overflow-hidden`}>
              {cfg.rank === 1 && (
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent animate-pulse" />
              )}
              <span className={`font-mono font-extrabold text-2xl ${cfg.color} z-10`}>#{cfg.rank}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
