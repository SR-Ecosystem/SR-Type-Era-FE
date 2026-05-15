import { motion } from "framer-motion";
import { Player } from "../hooks/useSocket";

interface Props {
  players: Player[];
  myId?: string;
  gameEnded?: boolean; // show position badges only when race is complete
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RacingTrack({ players, myId, gameEnded = false }: Props) {
  // Sort purely by progress then wpm to show dynamic live rankings at all times
  const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm);

  return (
    <div className="card p-6 flex flex-col gap-6 w-full overflow-hidden bg-white/60 backdrop-blur-md border-2 border-slate-100 shadow-sm rounded-xl mb-6">
      {sortedPlayers.length === 0 ? (
        <div className="text-center text-slate-400 py-4 text-sm font-semibold">Waiting for players to join...</div>
      ) : (
        sortedPlayers.map((p, i) => {
          const isMe = p.userId === myId;
          const rankIndex = sortedPlayers.findIndex(r => r.userId === p.userId);
          const isFinished = p.progress >= 100;
          const showMedal = gameEnded || isFinished;
          const medal = showMedal ? (MEDALS[rankIndex] ?? `#${rankIndex + 1}`) : null;

          return (
            <motion.div layout transition={{ type: "spring", stiffness: 100, damping: 15 }} key={p.userId} className="relative w-full flex items-center group">
              {/* Label */}
              <div className="w-28 shrink-0 flex flex-col items-end pr-4 z-10">
                <div className="flex items-center gap-1.5 justify-end w-full">
                  {/* Position badge — shown after game ends OR if player has finished */}
                  {showMedal && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="text-base leading-none"
                    >
                      {medal}
                    </motion.span>
                  )}
                  <span className={`text-sm font-bold truncate text-right ${isMe ? "text-primary" : "text-slate-600"}`}>
                    {p.userName}
                  </span>
                </div>
                {isMe && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">(you)</span>}
              </div>

              {/* Track Line */}
              <div className="flex-1 relative h-8 border-b-2 border-dashed border-slate-300">
                {/* Finish line */}
                {isFinished && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-0 top-0 bottom-0 w-[3px] bg-emerald-400 rounded"
                  />
                )}
                {/* The Car */}
                <motion.div
                  initial={false}
                  animate={{ left: `${Math.min(100, Math.max(0, p.progress || 0))}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="absolute bottom-[2px] -translate-x-1/2 flex flex-col items-center z-20"
                >
                  <div style={{ filter: `hue-rotate(${i * 55}deg)`, transform: "scaleX(-1)" }} className="text-3xl drop-shadow-md">
                    🏎️
                  </div>
                </motion.div>
              </div>

              {/* WPM */}
              <div className="w-16 shrink-0 text-right pl-4">
                <span className={`font-mono font-bold text-sm ${isMe ? "text-primary" : "text-slate-500"}`}>
                  {p.wpm} <span className="text-[10px] uppercase">wpm</span>
                </span>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
