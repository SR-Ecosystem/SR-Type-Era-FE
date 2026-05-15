import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Activity, Gamepad2 } from "lucide-react";
import { adminDashAPI } from "../../api/services";
import Navbar from "../../components/Navbar";
import StatsCard from "../../components/StatsCard";

interface Stats {
  totalStudents: number;
  totalCompetitions: number;
  activeCompetitions: number;
  totalGamesPlayed: number;
}

const ACTIVITY = [
  { msg: "Platform is live and accepting connections", time: "Just now" },
  { msg: "Socket.IO real-time engine active", time: "Just now" },
  { msg: "MongoDB connection established", time: "Just now" },
  { msg: "Admin session started", time: "Just now" },
];

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashAPI.getStats()
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isAdmin />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">Admin Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[0,1,2,3].map(i => <div key={i} className="card h-28 animate-pulse bg-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Students"     value={stats?.totalStudents ?? 0}     icon={Users}    delay={0} />
            <StatsCard title="Total Competitions" value={stats?.totalCompetitions ?? 0} icon={Trophy}   delay={0.1} />
            <StatsCard title="Active Now"         value={stats?.activeCompetitions ?? 0} icon={Activity} delay={0.2} trend={stats?.activeCompetitions ? "Live" : undefined} color="text-red-500" />
            <StatsCard title="Games Played"       value={stats?.totalGamesPlayed ?? 0}  icon={Gamepad2} delay={0.3} />
          </div>
        )}

        <h2 className="text-lg font-bold mb-4">System Status</h2>
        <div className="card overflow-hidden">
          {ACTIVITY.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">{item.msg}</span>
              </div>
              <span className="text-xs text-slate-400 shrink-0 ml-4">{item.time}</span>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <h2 className="text-lg font-bold mb-4 mt-8">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <motion.a href="/admin/competitions"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold">Manage Competitions</div>
              <div className="text-sm text-slate-500">Create, start, end, and delete competitions</div>
            </div>
          </motion.a>
          <motion.a href="/admin/results"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold">View Results</div>
              <div className="text-sm text-slate-500">Browse and export all competition results</div>
            </div>
          </motion.a>
        </div>
      </main>
    </div>
  );
}
