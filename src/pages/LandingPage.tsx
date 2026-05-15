import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Keyboard, Zap, Trophy, Users, Target, BarChart3, Shield, ArrowRight, Star } from "lucide-react";

const features = [
  { icon: Zap,      title: "Real-Time Competitions",  desc: "Compete live against other typists with instant WPM tracking." },
  { icon: Trophy,   title: "Global Leaderboards",     desc: "Climb the ranks and get featured on the podium for top 3 finishes." },
  { icon: Target,   title: "Accuracy Tracking",       desc: "Every keystroke counts. Track errors and improve over time." },
  { icon: BarChart3,title: "Detailed Analytics",      desc: "View games played, best WPM, accuracy trends, and wins." },
  { icon: Users,    title: "Multiplayer Rooms",        desc: "Join competitions with classmates or players worldwide." },
  { icon: Shield,   title: "Admin Controls",           desc: "Create competitions, manage students, and export CSV results." },
];
const stats = [
  { value: "500+", label: "Active Players" },
  { value: "120+", label: "Competitions" },
  { value: "98%",  label: "Uptime" },
  { value: "150",  label: "Top WPM Record" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">SRTypeEra</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-4 py-2">Log In</Link>
            <Link to="/register" className="gradient-hero text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-bg py-24 md:py-36">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary-light rounded-full px-4 py-1.5 text-sm font-bold mb-6">
              <Star className="h-4 w-4" /> The #1 Typing Competition Platform
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
          >
            Type Faster.<br />
            <span className="text-gradient">Compete Harder.</span><br />
            Win Big.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-xl mx-auto mb-10"
          >
            Join SRTypeEra — the ultimate real-time typing competition platform. Challenge your peers, improve your WPM, and climb the global leaderboard.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link to="/register" className="gradient-hero text-white rounded-xl px-8 py-3.5 font-bold flex items-center gap-2 hover:opacity-90 shadow-lg transition-all hover:shadow-xl">
              Start Competing <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="bg-white text-slate-700 border border-slate-200 rounded-xl px-8 py-3.5 font-semibold hover:bg-slate-50 transition-colors">
              Log In
            </Link>
          </motion.div>

          {/* Preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="card mt-16 p-6 text-left shadow-xl max-w-xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="text-xs text-slate-400 ml-2 font-mono">SRTypeEra — Speed Sprint</span>
            </div>
            <div className="font-mono text-base leading-8">
              <span className="text-primary-light">The quick brown fox </span>
              <span className="text-emerald-500">jumps over </span>
              <span className="text-red-500 bg-red-50 px-0.5 rounded">teh</span>
              <span className="text-slate-300"> lazy dog. Programming is the art of telling another human being what one wants the computer to do.</span>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary-light" /><span className="font-mono text-sm font-bold">87 WPM</span></div>
              <div className="flex items-center gap-1.5"><Target className="h-4 w-4 text-emerald-500" /><span className="font-mono text-sm font-bold">96% Acc</span></div>
              <div className="ml-auto text-xs text-slate-400 font-mono">00:42 left</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-4xl font-extrabold text-gradient">{s.value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Features</div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Everything you need to compete</h2>
          <p className="text-slate-500 max-w-md mx-auto">From live multiplayer to detailed analytics, SRTypeEra has it all.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="card p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary-light" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 max-w-6xl mx-auto px-4">
        <div className="gradient-hero rounded-2xl p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-4xl font-extrabold text-white mb-4 relative z-10">Ready to test your speed?</h2>
          <p className="text-white/75 mb-8 max-w-md mx-auto relative z-10">Join thousands of typists competing in real-time.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary font-bold rounded-xl px-8 py-3.5 hover:bg-slate-100 transition-colors shadow-lg relative z-10">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-hero flex items-center justify-center">
              <Keyboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">SRTypeEra</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 SRTypeEra. All rights reserved.</p>
          <Link to="/admin/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Admin →</Link>
        </div>
      </footer>
    </div>
  );
}
