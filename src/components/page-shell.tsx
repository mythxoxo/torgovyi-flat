"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DesktopShell } from "./desktop-shell";
import { MobileShell } from "./mobile-shell";
import { defaultLocale, messages, type Locale } from "../lib/i18n";

export type ThemeMode = "light" | "dark";

type UiContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  t: (typeof messages)[Locale];
};

const UiContext = createContext<UiContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  theme: "light",
  setTheme: () => {},
  t: messages[defaultLocale]
});

export const useUi = () => useContext(UiContext);

const LOCALE_KEY = "gram-locale";
const THEME_KEY = "gram-theme";

export function PageShell({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLocal = window.localStorage.getItem(LOCALE_KEY);
    const savedCookie = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${LOCALE_KEY}=`))
      ?.split("=")[1];
    const saved = savedLocal || savedCookie;
    if (saved === "ru" || saved === "en") setLocaleState(saved);

    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") setThemeState(savedTheme);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("theme-light", theme === "light");
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_KEY, next);
      document.cookie = `${LOCALE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    }
  };

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, next);
      document.cookie = `${THEME_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    }
  };

  const value = useMemo(() => ({ locale, setLocale, theme, setTheme, t: messages[locale] }), [locale, theme]);

  return (
    <UiContext.Provider value={value}>
      <div className={theme === "light" ? "theme-light hidden min-h-screen xl:block" : "theme-dark hidden min-h-screen xl:block"}>
        <DesktopShell>{children}</DesktopShell>
      </div>
      <div className={theme === "light" ? "theme-light xl:hidden" : "theme-dark xl:hidden"}>
        <MobileShell>{children}</MobileShell>
      </div>
    </UiContext.Provider>
  );
}
