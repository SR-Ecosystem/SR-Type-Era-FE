import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { Player } from "../hooks/useSocket";

interface Props {
  players: Player[];
  myId?: string;
  compact?: boolean;
  title?: string;
}

const RANK_COLORS = ["text-yellow-500", "text-slate-400", "text-amber-600"];

export default function Leaderboard({ players, myId, compact = false, title = "Live Leaderboard" }: Props) {
  const sorted = [...players].sort((a, b) => b.wpm - a.wpm);
  const maxWpm = Math.max(...sorted.map(p => p.wpm), 1);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <Trophy className="h-4 w-4 text-primary-light" />
        <span className="text-sm font-bold">{title}</span>
        <span className="ml-auto text-xs text-slate-400 font-mono">{players.length} player{players.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="divide-y divide-slate-100">
        <AnimatePresence initial={false}>
          {sorted.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">Waiting for players…</div>
          )}
          {sorted.map((player, i) => {
            const isMe = player.userId === myId;
            const pct  = Math.round((player.progress || 0));
            return (
              <motion.div
                key={player.userId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={`px-4 py-3 ${isMe ? "bg-primary/5" : "hover:bg-slate-50"} transition-colors`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono font-bold text-sm w-6 ${RANK_COLORS[i] ?? "text-slate-400"}`}>
                      #{i + 1}
                    </span>
                    <div>
                      <span className="text-sm font-semibold">
                        {player.userName}
                        {isMe && <span className="ml-1 text-xs text-primary font-normal">(you)</span>}
                      </span>
                      {player.finished && (
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">✓ Done</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!compact && (
                      <span className="text-xs text-slate-400 font-mono">{player.accuracy}%</span>
                    )}
                    <span className="font-mono font-bold text-sm text-primary-light">{player.wpm} WPM</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-hero"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
