import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { today } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoodEntry {
  date: string;
  mood: number;
  note: string;
}

const MOODS = [
  { value: 1, label: "Rough" },
  { value: 2, label: "Meh" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

// Selected-state styling for each mood pill.
const MOOD_COLORS: Record<number, string> = {
  1: "text-rose-600 dark:text-rose-400 border-rose-500/50 bg-rose-500/10",
  2: "text-orange-600 dark:text-orange-400 border-orange-500/50 bg-orange-500/10",
  3: "text-amber-600 dark:text-amber-400 border-amber-500/50 bg-amber-500/10",
  4: "text-lime-700 dark:text-lime-400 border-lime-500/50 bg-lime-500/10",
  5: "text-emerald-600 dark:text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
};

// Solid color: used for the dot and the 14-day bars.
const MOOD_BAR: Record<number, string> = {
  1: "bg-rose-500",
  2: "bg-orange-500",
  3: "bg-amber-500",
  4: "bg-lime-500",
  5: "bg-emerald-500",
};

function MoodDot({ mood, className }: { mood: number; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", MOOD_BAR[mood], className)} />;
}

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
          <div className="flex flex-wrap gap-2 justify-center">
            {MOODS.map(m => {
              const active = selected === m.value || (!selected && todayEntry?.mood === m.value);
              return (
                <button key={m.value} onClick={() => setSelected(m.value)} aria-pressed={active}
                  className={cn("flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    active
                      ? MOOD_COLORS[m.value]
                      : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}>
                  <MoodDot mood={m.value} className={cn(!active && "opacity-70")} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {(selected ?? todayEntry) && (
            <>
              <RichTextEditor value={note} onChange={setNote} variant="compact"
                placeholder="Optional note… (what influenced your mood?)"
                minHeightClass="min-h-[80px]" />
              <div className="flex items-center justify-between">
                {todayEntry && !selected && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Logged at {new Date().toLocaleDateString()} ·
                    <MoodDot mood={todayEntry.mood} />
                    {MOODS.find(m => m.value === todayEntry.mood)?.label}
                  </span>
                )}
                <Button size="sm" onClick={save} disabled={!selected} className={cn(!selected && "hidden")}>
                  {saved ? <><Check className="h-4 w-4" /> Logged</> : "Log Mood"}
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
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-popover border rounded-md px-2 py-1 text-xs whitespace-nowrap z-10">
                      {e ? <><MoodDot mood={e.mood} />{MOODS.find(m => m.value === e.mood)?.label}</> : "No entry"}
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
