import { useEffect, type ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  return <>{children}</>;
}
