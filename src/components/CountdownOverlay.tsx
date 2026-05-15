import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CountdownOverlay({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    // ── Audio Synthesis ──
    const playBeep = (freq: number, duration: number) => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
      } catch (e) { /* ignore audio err */ }
    };

    if (count > 0 && count <= 3) playBeep(440, 0.4); // Low beep for 3, 2, 1
    if (count === 0) playBeep(880, 0.8); // High beep for GO!

    if (count === 0) { 
      const t = setTimeout(() => onComplete(), 800); // give time to see green lights
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  // Determine light states based on count
  const l1 = count <= 3 ? (count === 0 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" : "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]") : "bg-slate-700";
  const l2 = count <= 2 ? (count === 0 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" : "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]") : "bg-slate-700";
  const l3 = count <= 1 ? (count === 0 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" : "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]") : "bg-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-800 p-4 rounded-xl border-[4px] border-slate-900 flex gap-4 shadow-2xl"
      >
        <div className={`w-16 h-16 rounded-full border-4 border-slate-900 transition-colors duration-200 ${l1}`} />
        <div className={`w-16 h-16 rounded-full border-4 border-slate-900 transition-colors duration-200 ${l2}`} />
        <div className={`w-16 h-16 rounded-full border-4 border-slate-900 transition-colors duration-200 ${l3}`} />
      </motion.div>
      <div className="mt-8 font-mono font-bold text-white text-3xl">
        {count === 0 ? "GO!" : "The race is about to start!"}
      </div>
    </div>
  );
}
