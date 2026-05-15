import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

type CharState = "idle" | "correct" | "wrong";

interface Stats { wpm: number; accuracy: number; chars: number; mistakes: number; }

interface Props {
  text: string;
  isActive: boolean;
  onStats?: (s: Stats) => void;
  onComplete?: () => void;
}

export default function TypingBox({ text, isActive, onStats, onComplete }: Props) {
  const [typed,     setTyped]     = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [shake,     setShake]     = useState(false);
  const [cumulativeMistakes, setCumulativeMistakes] = useState(0);
  const completedRef = useRef(false);
  const boxRef       = useRef<HTMLDivElement>(null);

  // Derive per-char state
  const chars: { ch: string; state: CharState }[] = text.split("").map((ch, i) => ({
    ch,
    state: i >= typed.length ? "idle" : typed[i] === ch ? "correct" : "wrong",
  }));

  const correct  = chars.filter(c => c.state === "correct").length;

  const calcStats = useCallback((): Stats => {
    const elapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
    const wpm      = elapsed > 0 ? Math.round((correct / 5) / elapsed) : 0;
    const accuracy = (correct + cumulativeMistakes) > 0 
      ? Math.round((correct / (correct + cumulativeMistakes)) * 100) 
      : 100;
    return { wpm, accuracy, chars: typed.length, mistakes: cumulativeMistakes };
  }, [startTime, typed.length, correct, cumulativeMistakes]);

  // Report stats on every keystroke
  useEffect(() => { onStats?.(calcStats()); }, [typed]); // eslint-disable-line

  // ── Audio Context for Sound Effects ──────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playSound = useCallback((type: "tick" | "error") => {
    try {
      const ctx = getAudioCtx();

      if (type === "tick") {
        // High-frequency 'click' (the switch snap)
        const clickOsc = ctx.createOscillator();
        clickOsc.type = "square";
        clickOsc.frequency.setValueAtTime(800, ctx.currentTime);
        clickOsc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.02);
        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(0.05, ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start();
        clickOsc.stop(ctx.currentTime + 0.03);

        // Low-frequency 'thock' (the bottoming out)
        const thockOsc = ctx.createOscillator();
        thockOsc.type = "sine";
        thockOsc.frequency.setValueAtTime(250, ctx.currentTime);
        thockOsc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
        const thockGain = ctx.createGain();
        thockGain.gain.setValueAtTime(0.2, ctx.currentTime);
        thockGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        thockOsc.connect(thockGain);
        thockGain.connect(ctx.destination);
        thockOsc.start();
        thockOsc.stop(ctx.currentTime + 0.05);
      } else {
        // Error 'buzz' (like a jammed key)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (err) { /* ignore audio errs */ }
  }, []);

  // Keydown handler
  useEffect(() => {
    if (!isActive) return;
    boxRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (!isActive || completedRef.current) return;

      if (e.key === "Backspace") {
        setTyped(p => p.slice(0, -1));
        playSound("tick");
        return;
      }
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;

      if (!startTime) setStartTime(Date.now());

      const idx = typed.length;
      if (idx >= text.length) return;

      // STRICT TYPING: If there's already a mistake at the end, block further typing.
      if (idx > 0 && typed[idx - 1] !== text[idx - 1]) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        playSound("error");
        return;
      }

      if (e.key !== text[idx]) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        playSound("error");
        
        // Append it as a mistake (which will block the next key until backspaced)
        // Only increment if they aren't already stuck on a mistake for this index
        if (typed[idx] === undefined) {
          setCumulativeMistakes(prev => prev + 1);
        }
        setTyped(typed + e.key);
      } else {
        playSound("tick");
        const next = typed + e.key;
        setTyped(next);

        if (next.length >= text.length && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete?.(), 200);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, typed, text, startTime, onComplete, playSound]); // eslint-disable-line

  // Reset when new game starts
  useEffect(() => {
    if (isActive) {
      setTyped("");
      setStartTime(null);
      setCumulativeMistakes(0);
      completedRef.current = false;
    }
  }, [isActive]);

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      className={`card p-6 font-mono text-lg md:text-xl leading-[2] select-none cursor-text outline-none
        focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all
        ${shake ? "shake" : ""}`}
      onClick={() => boxRef.current?.focus()}
    >
      <div className="flex flex-wrap">
        {chars.map(({ ch, state }, i) => {
          const isCursor = i === typed.length && isActive;
          const display  = ch === " " ? "\u00A0" : ch;
          return (
            <span key={i} className="relative">
              {isCursor && (
                <motion.span
                  layoutId="caret"
                  className="absolute left-0 top-[0.1em] bottom-[0.1em] w-[2px] bg-primary caret-blink"
                />
              )}
              <span className={
                state === "correct" ? "text-primary-light" :
                state === "wrong"   ? "text-red-500 bg-red-50 underline underline-offset-2 decoration-red-400" :
                "text-slate-300"
              }>
                {display}
              </span>
            </span>
          );
        })}
      </div>
      {!isActive && typed.length === 0 && (
        <p className="text-slate-400 text-sm mt-4 font-sans">
          Waiting for competition to start…
        </p>
      )}
    </div>
  );
}
