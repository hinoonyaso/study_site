import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

type PomodoroTimerProps = {
  onSessionComplete?: () => void;
};

const FOCUS_DURATION = 25 * 60; // 25 min
const BREAK_DURATION = 5 * 60; // 5 min

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [remaining, setRemaining] = useState(FOCUS_DURATION);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = mode === "focus" ? FOCUS_DURATION : BREAK_DURATION;
  const progress = ((duration - remaining) / duration) * 100;

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        setRunning(false);
        // Play notification sound
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          osc.frequency.value = 800;
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch { /* silent fallback */ }

        if (mode === "focus") {
          onSessionComplete?.();
          setMode("break");
          return BREAK_DURATION;
        } else {
          setMode("focus");
          return FOCUS_DURATION;
        }
      }
      return prev - 1;
    });
  }, [mode, onSessionComplete]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  const reset = () => {
    setRunning(false);
    setRemaining(mode === "focus" ? FOCUS_DURATION : BREAK_DURATION);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Compact mode for topbar
  if (!expanded) {
    return (
      <button
        className={`pomodoro-compact ${running ? "is-running" : ""}`}
        onClick={() => setExpanded(true)}
        title="포모도로 타이머"
        type="button"
      >
        <Timer size={14} aria-hidden />
        <span>{timeStr}</span>
      </button>
    );
  }

  return (
    <div className="pomodoro-expanded">
      <div className="pomodoro-header">
        <div className="pomodoro-mode">{mode === "focus" ? "집중" : "휴식"}</div>
        <button className="pomodoro-close" onClick={() => setExpanded(false)} type="button">
          ✕
        </button>
      </div>

      <div className="pomodoro-ring">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--line)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={mode === "focus" ? "var(--teal)" : "var(--amber)"}
            strokeDasharray={`${(progress * 276.46) / 100} 276.46`}
            strokeLinecap="round"
            strokeWidth="6"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <strong className="pomodoro-time">{timeStr}</strong>
      </div>

      <div className="pomodoro-controls">
        <button className="icon-button" onClick={() => setRunning(!running)} type="button">
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "정지" : "시작"}
        </button>
        <button className="icon-button" onClick={reset} type="button">
          <RotateCcw size={16} />
          리셋
        </button>
      </div>
    </div>
  );
}
