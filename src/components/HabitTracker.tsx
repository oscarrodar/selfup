import { useState } from "react";
import { Check, Flame, Plus, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { today } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  completedDates: string[];
}

const EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "🥗", "😴", "✍️", "🎯", "🌿"];

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  const t = today();
  let streak = 0;
  let check = t;
  for (const d of sorted) {
    if (d === check) {
      streak++;
      const dt = new Date(check);
      dt.setDate(dt.getDate() - 1);
      check = dt.toISOString().split("T")[0];
    } else {
      break;
    }
  }
  return streak;
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export function HabitTracker() {
  const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);
  const [newName, setNewName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💪");
  const [showAdd, setShowAdd] = useState(false);
  const t = today();
  const last7 = getLast7Days();

  const toggle = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(t);
      return { ...h, completedDates: done ? h.completedDates.filter(d => d !== t) : [...h.completedDates, t] };
    }));
  };

  const add = () => {
    if (!newName.trim()) return;
    setHabits([...habits, { id: crypto.randomUUID(), name: newName.trim(), emoji: selectedEmoji, completedDates: [] }]);
    setNewName("");
    setShowAdd(false);
  };

  const remove = (id: string) => setHabits(habits.filter(h => h.id !== id));

  const todayDow = (new Date().getDay() + 6) % 7;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Habit Tracker</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{habits.filter(h => h.completedDates.includes(t)).length}/{habits.length} done today</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "Cancel" : "Add Habit"}
        </Button>
      </div>

      {showAdd && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-5 space-y-3">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setSelectedEmoji(e)}
                  className={cn("text-xl p-1.5 rounded-lg transition-colors", selectedEmoji === e ? "bg-primary/30" : "hover:bg-secondary")}>
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Habit name…" onKeyDown={e => e.key === "Enter" && add()} />
              <Button onClick={add} disabled={!newName.trim()}>Add</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {habits.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No habits yet. Add your first one above.</CardContent></Card>
      )}

      <div className="space-y-2">
        {habits.map(h => {
          const done = h.completedDates.includes(t);
          const streak = calcStreak(h.completedDates);
          return (
            <Card key={h.id} className={cn("transition-all", done && "border-primary/40 bg-primary/5")}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(h.id)}
                    className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                      done ? "border-primary bg-primary text-white" : "border-border hover:border-primary/60")}>
                    {done && <Check className="h-4 w-4" />}
                  </button>
                  <span className="text-xl">{h.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium leading-none", done && "line-through text-muted-foreground")}>{h.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex gap-1">
                        {last7.map((day, i) => (
                          <div key={day} title={day}
                            className={cn("h-2 w-2 rounded-full transition-colors",
                              h.completedDates.includes(day) ? "bg-primary" : "bg-secondary",
                              i === todayDow && "ring-1 ring-primary/60")} />
                        ))}
                      </div>
                      {streak > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-400">
                          <Flame className="h-3 w-3" />{streak}d
                        </span>
                      )}
                    </div>
                  </div>
                  {streak >= 7 && <Badge variant="warning">🔥 On fire</Badge>}
                  <Button variant="ghost" size="icon" onClick={() => remove(h.id)}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-foreground h-7 w-7">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
