import { useState } from "react";
import { Plus, X, Minus, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  createdAt: string;
}

const COLORS = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
const COLOR_TEXT: Record<string, string> = {
  "bg-violet-500": "text-violet-400",
  "bg-blue-500": "text-blue-400",
  "bg-emerald-500": "text-emerald-400",
  "bg-amber-500": "text-amber-400",
  "bg-rose-500": "text-rose-400",
  "bg-cyan-500": "text-cyan-400",
};

export function GoalSetting() {
  const [goals, setGoals] = useLocalStorage<Goal[]>("goals", []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target: "", unit: "", color: COLORS[0] });

  const add = () => {
    if (!form.title.trim() || !form.target) return;
    setGoals([...goals, {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim(),
      current: 0,
      target: Number(form.target),
      unit: form.unit.trim() || "units",
      color: form.color,
      createdAt: new Date().toISOString(),
    }]);
    setForm({ title: "", description: "", target: "", unit: "", color: COLORS[0] });
    setShowAdd(false);
  };

  const adjust = (id: string, delta: number) => {
    setGoals(goals.map(g => g.id === id
      ? { ...g, current: Math.max(0, Math.min(g.target, g.current + delta)) }
      : g
    ));
  };

  const remove = (id: string) => setGoals(goals.filter(g => g.id !== id));

  const completed = goals.filter(g => g.current >= g.target).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Goals & Progress</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{completed}/{goals.length} goals achieved</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "Cancel" : "New Goal"}
        </Button>
      </div>

      {showAdd && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-5 space-y-3">
            <Input placeholder="Goal title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Input placeholder="Target *" type="number" min="1" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-32" />
              <Input placeholder="Unit (km, books…)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Color:</span>
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={cn("h-6 w-6 rounded-full transition-all", c,
                    form.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-white scale-110" : "opacity-60 hover:opacity-100")} />
              ))}
            </div>
            <Button onClick={add} disabled={!form.title.trim() || !form.target} className="w-full">Add Goal</Button>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No goals yet. Set your first goal above.</CardContent></Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {goals.map(g => {
          const pct = Math.round((g.current / g.target) * 100);
          const done = g.current >= g.target;
          return (
            <Card key={g.id} className={cn("relative overflow-hidden transition-all", done && "border-emerald-500/40")}>
              <div className={cn("absolute top-0 left-0 w-1 h-full", g.color)} />
              <CardContent className="pt-4 pb-4 pl-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold leading-none">{g.title}</h3>
                      {done && <Badge variant="success">Done!</Badge>}
                    </div>
                    {g.description && <p className="text-xs text-muted-foreground mt-1">{g.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(g.id)} className="h-6 w-6 text-muted-foreground shrink-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Progress value={pct} className="h-1.5 mb-2" />
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", COLOR_TEXT[g.color] || "text-primary")}>
                    {g.current} / {g.target} {g.unit}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => adjust(g.id, -1)} className="h-6 w-6" disabled={g.current === 0}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground w-8 text-center">{pct}%</span>
                    <Button variant="ghost" size="icon" onClick={() => adjust(g.id, 1)} className="h-6 w-6" disabled={done}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
