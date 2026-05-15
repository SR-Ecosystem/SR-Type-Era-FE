import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Zap, Target, AlertCircle, Type } from "lucide-react";
import Navbar           from "../components/Navbar";
import TypingBox        from "../components/TypingBox";
import LogoLoader       from "../components/LogoLoader";
import RacingTrack      from "../components/RacingTrack";
import CountdownOverlay from "../components/CountdownOverlay";
import StatsCard        from "../components/StatsCard";
import { useAuth }      from "../context/AuthContext";
import { useSocket, Player } from "../hooks/useSocket";
import { competitionAPI, resultAPI } from "../api/services";
import { Competition, GameResult } from "../utils/types";
import toast from "react-hot-toast";

type Phase = "loading" | "waiting" | "countdown" | "playing" | "finished";

export default function Game() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compId = searchParams.get("comp");

  const [phase,       setPhase]       = useState<Phase>("loading");
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [stats,       setStats]       = useState<GameResult>({ wpm: 0, accuracy: 100, chars: 0, mistakes: 0 });
  const [players,     setPlayers]     = useState<Player[]>([]);
  const [startTime,   setStartTime]   = useState<number | null>(null);

  const statsRef    = useRef(stats);
  const playersRef  = useRef(players);
  statsRef.current  = stats;
  playersRef.current = players;

  // ── Socket callbacks ────────────────────────────────────────────────────────
  const onRoomPlayers = useCallback((ps: Player[]) => {
    setPlayers(prev => {
      const me = prev.find(p => p.userId === user?._id);
      const others = ps.filter(p => p.userId !== user?._id);
      if (!me && user) {
        return [{ userId: user._id, userName: user.name, wpm: 0, accuracy: 100, progress: 0 }, ...others];
      }
      return me ? [me, ...others] : others;
    });
  }, [user]);

  const onPlayerJoined = useCallback(({ userId, userName }: { userId: string; userName: string }) => {
    setPlayers(prev => {
      if (prev.find(p => p.userId === userId)) return prev;
      toast(`${userName} joined!`, { icon: "👋" });
      return [...prev, { userId, userName, wpm: 0, accuracy: 100, progress: 0 }];
    });
  }, []);

  const onPlayerLeft = useCallback(({ userId }: { userId: string }) => {
    setPlayers(prev => prev.filter(p => p.userId !== userId));
  }, []);

  const onPlayerProgress = useCallback(({ userId, wpm, accuracy, progress }: any) => {
    setPlayers(prev => prev.map(p => p.userId === userId ? { ...p, wpm, accuracy, progress } : p));
  }, []);

  const onPlayerFinished = useCallback(({ userId, wpm, accuracy }: any) => {
    setPlayers(prev => prev.map(p => p.userId === userId ? { ...p, wpm, accuracy, progress: 100, finished: true } : p));
  }, []);

  const handleGameEndRef = useRef<((forced?: boolean) => Promise<void>) | null>(null);

  const onCompetitionEnded = useCallback(() => {
    toast("Competition ended by admin", { icon: "🏁" });
    if (handleGameEndRef.current) handleGameEndRef.current(true);
  }, []);

  const onCompetitionStarted = useCallback(() => {
    toast("Competition started!", { icon: "🚀" });
    setPhase("countdown");
  }, []);

  const { emitProgress, emitFinished } = useSocket({
    competitionId: competition?._id ?? null,
    userId: user?._id ?? null,
    userName: user?.name ?? null,
    onRoomPlayers, onPlayerJoined, onPlayerLeft,
    onPlayerProgress, onPlayerFinished, onCompetitionEnded, onCompetitionStarted
  });

  // ── Load competition ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!compId) { navigate("/dashboard"); return; }
    
    Promise.all([
      competitionAPI.getById(compId),
      resultAPI.getMyResults()
    ])
      .then(([compRes, myRes]) => {
        const comp = compRes.data.competition;
        const results = myRes.data.results;
        
        if (results.some((r: any) => r.competition?._id === comp._id)) {
          toast.error("You have already completed this competition.");
          navigate("/dashboard");
          return;
        }

        setCompetition(comp);
        // Seed self into players list
        setPlayers([{ userId: user!._id, userName: user!.name, wpm: 0, accuracy: 100, progress: 0 }]);
        if (comp.status === "Waiting") {
          setPhase("waiting");
        } else {
          setPhase("countdown");
        }
      })
      .catch(err => {
        toast.error(err.response?.data?.message || "Competition not available");
        navigate("/dashboard");
      });
  }, [compId]); // eslint-disable-line

  // ── Stats update from TypingBox ──────────────────────────────────────────────
  const handleStats = useCallback((s: GameResult) => {
    setStats(s);
    // Update self in players list
    setPlayers(prev => prev.map(p =>
      p.userId === user?._id ? { ...p, wpm: s.wpm, accuracy: s.accuracy, progress: Math.round((s.chars / (competition?.paragraph?.length || 1)) * 100) } : p
    ));
    // Emit to socket (throttled inside useSocket consumer)
    const progress = Math.round((s.chars / (competition?.paragraph?.length || 1)) * 100);
    emitProgress(s.wpm, s.accuracy, progress);
  }, [user?._id, competition?.paragraph?.length, emitProgress]);

  const [isDone, setIsDone] = useState(false);
  const isDoneRef = useRef(isDone);
  isDoneRef.current = isDone;

  const handlePlayerComplete = useCallback(async () => {
    if (phase === "finished" || isDoneRef.current) return;
    setIsDone(true);
    isDoneRef.current = true;

    const s = statsRef.current;
    const comp = competition;
    if (!comp) return;

    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : comp.timeLimit;
    emitFinished(s.wpm, s.accuracy);

    try {
      await resultAPI.submit({
        competitionId: comp._id,
        wpm: s.wpm, accuracy: s.accuracy,
        mistakes: s.mistakes, chars: s.chars,
        timeTaken, completed: true,
      });
    } catch (err: any) {
      if (err.response?.status !== 409) console.warn("Submit error:", err.message);
    }
  }, [phase, competition, startTime, emitFinished]);

  const handleGameEnd = useCallback(async (forced = false) => {
    if (phase === "finished") return;
    setPhase("finished");

    const comp = competition;
    if (!comp) return;

    // If not yet submitted (timer ran out or admin ended), submit now
    if (!isDoneRef.current) {
      setIsDone(true);
      isDoneRef.current = true;
      const s = statsRef.current;
      const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      emitFinished(s.wpm, s.accuracy);
      try {
        await resultAPI.submit({
          competitionId: comp._id,
          wpm: s.wpm, accuracy: s.accuracy,
          mistakes: s.mistakes, chars: s.chars,
          timeTaken, completed: !forced,
        });
      } catch (err: any) {}
    }

    // Small buffer to allow all lingering submissions from other players to hit the DB
    await new Promise(res => setTimeout(res, 800));

    let finalPlayers = [...playersRef.current];
    try {
      const lb = await resultAPI.getLeaderboard(comp._id);
      if (lb.data?.leaderboard?.length > 0) {
        finalPlayers = finalPlayers.map(p => {
          const dbMatch = lb.data.leaderboard.find((r: any) => String(r.userId) === String(p.userId));
          if (dbMatch) {
            return { ...p, wpm: dbMatch.wpm, accuracy: dbMatch.accuracy, progress: 100, finished: true };
          }
          return p;
        });
      }
    } catch {}

    navigate("/result", { state: { stats: statsRef.current, players: finalPlayers, myId: user?._id, competition: comp } });
  }, [phase, competition, startTime, emitFinished, navigate, user?._id]);

  useEffect(() => {
    handleGameEndRef.current = handleGameEnd;
  }, [handleGameEnd]);

  useEffect(() => {
    // Auto-end the game if all players have 100% progress and we have at least 1 player
    if (phase === "playing" && players.length > 0 && players.every(p => p.progress === 100)) {
      handleGameEnd(false);
    }
  }, [players, phase, handleGameEnd]);

  const handleCountdownDone = useCallback(() => {
    setPhase("playing");
    setStartTime(Date.now());
  }, []);

  if (phase === "loading" || !competition) {
    return <LogoLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {phase === "countdown" && <CountdownOverlay onComplete={handleCountdownDone} />}
      {phase === "waiting" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="text-4xl mb-4 animate-bounce">⏳</div>
            <h2 className="text-xl font-bold mb-2">Waiting for Admin</h2>
            <p className="text-slate-500 text-sm">Get your fingers ready! The competition will start as soon as the admin clicks Start.</p>
          </motion.div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{competition.name}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{players.length} player{players.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Top: Racing Track */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <RacingTrack players={players} myId={user?._id} gameEnded={isDone} />
          </motion.div>

          {/* Bottom: typing + stats */}
          <div className="space-y-4">
            {isDone ? (
              <div className="card p-10 flex flex-col items-center justify-center text-center space-y-4 border-2 border-emerald-100 bg-emerald-50/30">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-3xl">🏁</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">You finished!</h2>
                <p className="text-slate-500">Waiting for other players to cross the line or admin to end the game...</p>
              </div>
            ) : (
              <TypingBox
                text={competition.paragraph ?? ""}
                isActive={phase === "playing"}
                onStats={handleStats}
                onComplete={handlePlayerComplete}
              />
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard title="WPM"       value={stats.wpm}           icon={Zap}         delay={0}   />
              <StatsCard title="Accuracy"  value={`${stats.accuracy}%`} icon={Target}      delay={0.05}/>
              <StatsCard title="Characters"value={stats.chars}         icon={Type}        delay={0.1} />
              <StatsCard title="Mistakes"  value={stats.mistakes}      icon={AlertCircle} delay={0.15} color="text-red-500"/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
