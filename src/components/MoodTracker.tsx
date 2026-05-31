import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { today } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoodEntry {
  date: string;
  mood: number;
  note: string;
}

const MOODS = [
  { value: 1, emoji: "😔", label: "Rough" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

const MOOD_COLORS: Record<number, string> = {
  1: "text-red-400 border-red-500/40 bg-red-500/10",
  2: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  3: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  4: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  5: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
};

const MOOD_BAR: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-blue-500",
  5: "bg-emerald-500",
};

function getLast14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });
}

export function MoodTracker() {
  const [entries, setEntries] = useLocalStorage<MoodEntry[]>("mood", []);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const t = today();
  const todayEntry = entries.find(e => e.date === t);
  const last14 = getLast14Days();

  const save = () => {
    if (!selected) return;
    const without = entries.filter(e => e.date !== t);
    setEntries([...without, { date: t, mood: selected, note: note.trim() }]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avg = entries.length
    ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)
    : null;

  const recent30 = entries.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Mood Tracker</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {avg ? `30-day average: ${avg}/5` : "Start logging to see trends"}
        </p>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <p className="text-sm font-medium">How are you feeling today?</p>
          <div className="flex gap-3 justify-center">
            {MOODS.map(m => (
              <button key={m.value} onClick={() => setSelected(m.value)}
                className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
                  selected === m.value
                    ? MOOD_COLORS[m.value]
                    : "border-border hover:border-border/80 hover:bg-secondary",
                  todayEntry?.mood === m.value && !selected && MOOD_COLORS[m.value]
                )}>
                <span className="text-2xl leading-none">{m.emoji}</span>
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          {(selected ?? todayEntry) && (
            <>
              <Textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Optional note… (what influenced your mood?)"
                className="min-h-[80px] text-sm" />
              <div className="flex items-center justify-between">
                {todayEntry && !selected && (
                  <span className="text-xs text-muted-foreground">
                    Logged at {new Date().toLocaleDateString()} · {MOODS.find(m => m.value === todayEntry.mood)?.emoji}
                  </span>
                )}
                <Button size="sm" onClick={save} disabled={!selected} className={cn(!selected && "hidden")}>
                  {saved ? "✓ Logged" : "Log Mood"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last 14 Days</p>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-end gap-1 h-16">
              {last14.map(d => {
                const e = entries.find(en => en.date === d);
                const height = e ? `${(e.mood / 5) * 100}%` : "10%";
                return (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-popover border rounded-md px-2 py-1 text-xs whitespace-nowrap z-10">
                      {e ? `${MOODS.find(m => m.value === e.mood)?.emoji ?? ""} ${MOODS.find(m => m.value === e.mood)?.label ?? ""}` : "No entry"}
                    </div>
                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        className={cn("w-full rounded-t transition-all", e ? MOOD_BAR[e.mood] : "bg-border/40", d === t && "ring-1 ring-primary/60")}
                        style={{ height }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 mt-1">
              {last14.map(d => (
                <div key={d} className="flex-1 text-center text-[9px] text-muted-foreground">
                  {new Date(d + "T00:00:00").getDate()}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {recent30.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Entries", value: recent30.length },
            { label: "Avg Mood", value: (recent30.reduce((s, e) => s + e.mood, 0) / recent30.length).toFixed(1) + "/5" },
            { label: "Best Days", value: recent30.filter(e => e.mood >= 4).length },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
