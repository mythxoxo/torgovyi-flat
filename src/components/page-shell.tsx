"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DesktopShell } from "./desktop-shell";
import { MobileShell } from "./mobile-shell";
import { defaultLocale, messages, type Locale } from "../lib/i18n";

type UiContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof messages)[Locale];
};

const UiContext = createContext<UiContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: messages[defaultLocale]
});

export const useUi = () => useContext(UiContext);

const COOKIE_NAME = "tonk-locale";

export function PageShell({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLocal = window.localStorage.getItem(COOKIE_NAME);
    const savedCookie = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];
    const saved = savedLocal || savedCookie;
    if (saved === "ru" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COOKIE_NAME, next);
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
    }
  };

  const value = useMemo(() => ({ locale, setLocale, t: messages[locale] }), [locale]);

  return (
    <UiContext.Provider value={value}>
      <div className="hidden min-h-screen xl:block">
        <DesktopShell>{children}</DesktopShell>
      </div>
      <div className="xl:hidden">
        <MobileShell>{children}</MobileShell>
      </div>
    </UiContext.Provider>
  );
}
