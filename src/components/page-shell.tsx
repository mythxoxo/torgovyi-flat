"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { DesktopShell } from "./desktop-shell";
import { MobileShell } from "./mobile-shell";
import { messages, type Locale } from "../lib/i18n";

export type ThemeMode = "light" | "dark";

const APP_LOCALE: Locale = "en";
const APP_THEME: ThemeMode = "dark";

type UiContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  t: (typeof messages)[Locale];
};

const UiContext = createContext<UiContextValue>({
  locale: APP_LOCALE,
  setLocale: () => {},
  theme: APP_THEME,
  setTheme: () => {},
  t: messages[APP_LOCALE]
});

export const useUi = () => useContext(UiContext);

export function PageShell({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      locale: APP_LOCALE,
      setLocale: () => {},
      theme: APP_THEME,
      setTheme: () => {},
      t: messages[APP_LOCALE]
    }),
    []
  );

  return (
    <UiContext.Provider value={value}>
      <div className="theme-dark hidden min-h-screen xl:block">
        <DesktopShell>{children}</DesktopShell>
      </div>
      <div className="theme-dark xl:hidden">
        <MobileShell>{children}</MobileShell>
      </div>
    </UiContext.Provider>
  );
}
