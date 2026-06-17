"use client";

import { Moon, Sun } from "lucide-react";
import { useUi } from "./page-shell";

export function ThemeSwitcher() {
  const { theme, setTheme } = useUi();
  const active = "bg-[#0088cc] text-white";
  const idle = "text-[var(--gram-muted)]";

  return (
    <div className="inline-flex items-center rounded-full border border-[var(--gram-border)] bg-[var(--gram-soft)] p-1">
      <button
        type="button"
        aria-label="Light theme"
        onClick={() => setTheme("light")}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${theme === "light" ? active : idle}`}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Dark theme"
        onClick={() => setTheme("dark")}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${theme === "dark" ? active : idle}`}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
