import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Zap, Target, XCircle, ArrowRight, Home } from "lucide-react";
import Navbar    from "../components/Navbar";
import Podium    from "../components/Podium";
import Leaderboard from "../components/Leaderboard";
import StatsCard from "../components/StatsCard";
import { GameResult } from "../utils/types";
import { Player }     from "../hooks/useSocket";
import { useAuth }    from "../context/AuthContext";

interface LocationState {
  stats: GameResult;
  players: Player[];
  myId: string;
  competition: { name: string };
}

export default function Result() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const state     = location.state as LocationState | null;

  if (!state) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const { stats, players, myId } = state;
  const sorted  = [...players].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm);
  const myRank  = sorted.findIndex(p => String(p.userId) === String(myId)) + 1;
  const isTop3  = myRank > 0 && myRank <= 3;

  const resultCards = [
    { title: "Final Rank",       value: myRank > 0 ? `#${myRank}` : "—", icon: Trophy, delay: 0,    color: "text-yellow-500" },
    { title: "Words Per Minute", value: stats.wpm,                        icon: Zap,    delay: 0.1                            },
    { title: "Accuracy",         value: `${stats.accuracy}%`,             icon: Target, delay: 0.2,  color: "text-emerald-500"},
    { title: "Mistakes",         value: stats.mistakes,                   icon: XCircle,delay: 0.3,  color: "text-red-500"   },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }} className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gradient">Competition Complete! 🎉</h1>
          <p className="text-slate-500 text-base font-medium">
            {isTop3
              ? `⭐ Fantastic work! You secured a spot in the Top ${myRank}! ⭐`
              : myRank > 0
              ? `You finished #${myRank}. Keep practising to reach the podium!`
              : "Great effort!"}
          </p>
        </motion.div>

        {/* Podium */}
        <Podium players={sorted} />

        {/* Your stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {resultCards.map(c => <StatsCard key={c.title} {...c} />)}
        </div>

        {/* Final leaderboard */}
        <Leaderboard players={sorted} myId={myId} title="Final Results" />

        {/* Actions */}
        <div className="flex gap-3 justify-center mt-8">
          <button onClick={() => navigate(-1)}
            className="gradient-hero text-white rounded-lg px-6 py-2.5 font-bold text-sm flex items-center gap-2 hover:opacity-90"
          >
            Play Again <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => navigate("/dashboard")}
            className="bg-slate-100 text-slate-700 rounded-lg px-6 py-2.5 font-bold text-sm flex items-center gap-2 hover:bg-slate-200"
          >
            <Home className="h-4 w-4" /> Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
