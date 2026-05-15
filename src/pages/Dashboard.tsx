import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Target, Trophy, Gamepad2, Users, Play } from "lucide-react";
import Navbar    from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import LogoLoader from "../components/LogoLoader";
import { useAuth }         from "../context/AuthContext";
import { competitionAPI, resultAPI } from "../api/services";
import { Competition, MyResult } from "../utils/types";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [results,      setResults]      = useState<MyResult[]>([]);
  const [loadingComps, setLoadingComps] = useState(true);
  const [loadingRes,   setLoadingRes]   = useState(true);

  useEffect(() => {
    refreshUser();
    competitionAPI.getActive()
      .then(r => setCompetitions(r.data.competitions))
      .catch(() => toast.error("Failed to load competitions"))
      .finally(() => setLoadingComps(false));
    resultAPI.getMyResults()
      .then(r => setResults(r.data.results))
      .catch(() => {})
      .finally(() => setLoadingRes(false));
  }, []); // eslint-disable-line

  const s = user?.stats;
  const statCards = [
    { title: "Games Played", value: s?.gamesPlayed ?? 0,           icon: Gamepad2, delay: 0   },
    { title: "Best WPM",     value: s?.bestWpm     ?? 0,           icon: Zap,      delay: 0.1 },
    { title: "Avg Accuracy", value: `${s?.avgAccuracy ?? 0}%`,     icon: Target,   delay: 0.2 },
    { title: "Total Wins",   value: s?.totalWins   ?? 0,           icon: Trophy,   delay: 0.3 },
  ];

  const joinComp = (id: string) => navigate(`/game?comp=${id}`);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Ready for your next challenge?</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(c => <StatsCard key={c.title} {...c} />)}
        </div>

        {/* Active Competitions */}
        <h2 className="text-base font-bold mb-4">Active Competitions</h2>
        {loadingComps ? (
          <div className="flex justify-center items-center mb-10 py-8">
            <LogoLoader />
          </div>
        ) : competitions.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 mb-10">
            <Trophy className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            No active competitions right now. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {competitions.map((c, i) => {
              const played = results.some(r => r.competition?._id === c._id);
              return (
              <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} className="card p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{c.name}</h3>
                  {c.status === "Waiting" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">Lobby</span>
                  ) : c.status === "Active" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">Live 🔴</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-500">{c.status}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.participantCount} player{c.participantCount !== 1 ? "s" : ""}</span>
                </div>
                {played ? (
                  <button disabled className="mt-auto w-full bg-slate-100 text-slate-400 rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2">
                    Completed
                  </button>
                ) : (
                  <button onClick={() => joinComp(c._id)}
                    className="mt-auto w-full gradient-hero text-white rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Play className="h-4 w-4" /> Join Competition
                  </button>
                )}
              </motion.div>
            )})}
          </div>
        )}

        {/* Recent Results */}
        <h2 className="text-base font-bold mb-4">Recent Results</h2>
        {loadingRes ? (
          <div className="flex justify-center items-center py-8">
            <LogoLoader />
          </div>
        ) : results.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">
            No results yet — join a competition to get started!
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Competition","Rank","WPM","Accuracy","Date"].map(h => (
                      <th key={h} className={`p-3 font-semibold text-slate-400 text-xs uppercase tracking-wide ${h!=="Competition"?"text-center":"text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium">{r.competition?.name ?? "—"}</td>
                      <td className="p-3 text-center font-mono font-bold text-primary-light">#{r.rank ?? "—"}</td>
                      <td className="p-3 text-center font-mono font-bold">{r.wpm}</td>
                      <td className="p-3 text-center font-mono">{r.accuracy}%</td>
                      <td className="p-3 text-center text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
