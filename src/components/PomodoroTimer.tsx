import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Settings, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

type Mode = "work" | "short" | "long";

const MODE_LABELS: Record<Mode, string> = { work: "Focus", short: "Short Break", long: "Long Break" };
const MODE_COLORS: Record<Mode, string> = {
  work: "text-violet-400",
  short: "text-emerald-400",
  long: "text-blue-400",
};
const MODE_RING: Record<Mode, string> = {
  work: "bg-violet-500/20 border-violet-500/40",
  short: "bg-emerald-500/20 border-emerald-500/40",
  long: "bg-blue-500/20 border-blue-500/40",
};

export function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage("pomodoro-settings", { work: 25, short: 5, long: 15 });
  const [sessions, setSessions] = useLocalStorage<number>("pomodoro-sessions", 0);
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const totalRef = useRef(settings.work * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    const d = settings[m] * 60;
    setTimeLeft(d);
    totalRef.current = d;
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [settings]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          if (mode === "work") setSessions(s => s + 1);
          try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...").play().catch(() => {}); } catch {}
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running, mode, setSessions]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = Math.round(((totalRef.current - timeLeft) / totalRef.current) * 100);

  const applySettings = () => {
    setSettings(tempSettings);
    const d = tempSettings[mode] * 60;
    setTimeLeft(d);
    totalRef.current = d;
    setRunning(false);
    setShowSettings(false);
  };

  const nextMode: Mode = mode === "work"
    ? (sessions % 4 === 3 ? "long" : "short")
    : "work";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Focus Timer</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{sessions} session{sessions !== 1 ? "s" : ""} completed today</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { setShowSettings(!showSettings); setTempSettings(settings); }}>
          {showSettings ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
        </Button>
      </div>

      {showSettings && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-medium">Timer Durations (minutes)</p>
            <div className="grid grid-cols-3 gap-3">
              {(["work", "short", "long"] as Mode[]).map(m => (
                <div key={m} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{MODE_LABELS[m]}</label>
                  <Input type="number" min="1" max="90" value={tempSettings[m]}
                    onChange={e => setTempSettings({ ...tempSettings, [m]: Math.max(1, Number(e.target.value)) })} />
                </div>
              ))}
            </div>
            <Button size="sm" onClick={applySettings} className="w-full">Apply</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 justify-center">
        {(["work", "short", "long"] as Mode[]).map(m => (
          <Button key={m} variant={mode === m ? "default" : "ghost"} size="sm"
            onClick={() => switchMode(m)} className="text-xs">
            {MODE_LABELS[m]}
          </Button>
        ))}
      </div>

      <Card className={cn("border transition-all", MODE_RING[mode])}>
        <CardContent className="pt-6 pb-6 flex flex-col items-center gap-6">
          <div className={cn("relative flex items-center justify-center rounded-full border-4 h-48 w-48 transition-all",
            running ? "animate-pulse-ring" : "", MODE_RING[mode])}>
            <div className="text-center">
              <p className={cn("text-5xl font-bold font-mono tabular-nums tracking-tight", MODE_COLORS[mode])}>
                {fmt(timeLeft)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{MODE_LABELS[mode]}</p>
            </div>
          </div>

          <Progress value={pct} className="w-full max-w-xs h-1" />

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => switchMode(mode)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="lg" onClick={() => setRunning(!running)}
              className={cn("w-28 gap-2", running && "bg-amber-500 hover:bg-amber-600")}>
              {running ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Start</>}
            </Button>
            <Button variant="outline" size="sm" onClick={() => switchMode(nextMode)} className="text-xs">
              Skip →
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: Math.max(4, Math.ceil(sessions / 4) * 4) }, (_, i) => (
          <div key={i} className={cn("h-2 rounded-full transition-all",
            i < sessions ? "bg-primary" : "bg-secondary")} />
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {4 - (sessions % 4)} more until long break
      </p>
    </div>
  );
}
