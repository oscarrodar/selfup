import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { today } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "What am I grateful for today?",
  "What's one thing I learned recently?",
  "What drained my energy today, and what gave me energy?",
  "What would make tomorrow even better?",
  "What am I most proud of this week?",
  "What challenge am I currently facing, and how can I reframe it?",
  "What's something I want to start, stop, or continue?",
];

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function Journal() {
  const [entries, setEntries] = useLocalStorage<Record<string, string>>("journal", {});
  const [currentDate, setCurrentDate] = useState(today());
  const [promptIndex] = useState(() => new Date().getDay() % PROMPTS.length);
  const [saved, setSaved] = useState(false);

  const t = today();
  const isToday = currentDate === t;
  const text = entries[currentDate] ?? "";

  const update = (val: string) => {
    setEntries({ ...entries, [currentDate]: val });
    setSaved(false);
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const allDates = Object.keys(entries).filter(k => entries[k].trim()).sort().reverse();
  const hasEntry = (d: string) => !!(entries[d]?.trim());

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Journal</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{allDates.length} {allDates.length === 1 ? "entry" : "entries"} total</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(offsetDate(currentDate, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant={isToday ? "default" : "outline"} size="sm" onClick={() => setCurrentDate(t)} className="text-xs px-3">
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(offsetDate(currentDate, 1))} disabled={isToday}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className={cn("border", hasEntry(currentDate) && !isToday && "border-primary/30")}>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{formatDisplay(currentDate)}</p>
            {hasEntry(currentDate) && <span className="text-xs text-emerald-400 flex items-center gap-1"><BookOpen className="h-3 w-3" />Saved</span>}
          </div>

          {isToday && (
            <div className="flex items-start gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground italic">{PROMPTS[promptIndex]}</p>
            </div>
          )}

          <Textarea
            value={text}
            onChange={e => update(e.target.value)}
            placeholder={isToday ? "Write your thoughts…" : "No entry for this day."}
            className="min-h-[200px] text-sm leading-relaxed"
            readOnly={!isToday}
          />

          {isToday && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{text.length} chars · {text.split(/\s+/).filter(Boolean).length} words</span>
              <Button size="sm" variant={saved ? "secondary" : "default"} onClick={save} disabled={!text.trim()}>
                {saved ? "✓ Saved" : "Save Entry"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {allDates.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Past Entries</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allDates.slice(0, 6).map(d => (
              <button key={d} onClick={() => setCurrentDate(d)}
                className={cn("text-left rounded-lg border px-3 py-2 transition-colors hover:border-primary/40",
                  currentDate === d ? "border-primary/60 bg-primary/10" : "border-border bg-card")}>
                <p className="text-xs font-medium">{new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{entries[d]?.slice(0, 40)}…</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
