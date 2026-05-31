import { useState } from "react";
import {
  CheckSquare,
  Target,
  BookOpen,
  Smile,
  Timer,
  Zap,
} from "lucide-react";
import { HabitTracker } from "@/components/HabitTracker";
import { GoalSetting } from "@/components/GoalSetting";
import { Journal } from "@/components/Journal";
import { MoodTracker } from "@/components/MoodTracker";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { cn } from "@/lib/utils";

type Tab = "habits" | "goals" | "journal" | "mood" | "pomodoro";

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "habits", label: "Habits", icon: CheckSquare, description: "Daily streak tracker" },
  { id: "goals", label: "Goals", icon: Target, description: "Progress toward your targets" },
  { id: "journal", label: "Journal", icon: BookOpen, description: "Daily reflection" },
  { id: "mood", label: "Mood", icon: Smile, description: "Emotional check-in" },
  { id: "pomodoro", label: "Focus", icon: Timer, description: "Pomodoro timer" },
];

function todayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function App() {
  const [active, setActive] = useState<Tab>("habits");

  const ActiveComponent = {
    habits: HabitTracker,
    goals: GoalSetting,
    journal: Journal,
    mood: MoodTracker,
    pomodoro: PomodoroTimer,
  }[active];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/50">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">SelfUp</h1>
              <p className="text-[10px] text-muted-foreground">Personal Growth Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "bg-primary/15 text-foreground border border-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-none">{tab.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{tab.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">{todayGreeting()}</p>
          <p className="text-xs font-medium mt-0.5">{today}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="border-b border-border px-5 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">SelfUp</span>
          </div>
          <span className="text-xs text-muted-foreground">{today}</span>
        </header>

        {/* Mobile tabs */}
        <div className="md:hidden flex border-b border-border overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2.5 text-[10px] font-medium shrink-0 transition-colors border-b-2",
                  isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 max-w-2xl w-full mx-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
