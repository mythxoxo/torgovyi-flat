"use client";

import { useUi } from "./page-shell";

export function LanguageSwitcher() {
  const { locale, setLocale } = useUi();
  return (
    <div className="rounded-full border border-white/8 bg-white/5 p-1">
      <button type="button" onClick={() => setLocale("ru")} className={`rounded-full px-3 py-1.5 text-xs ${locale === "ru" ? "bg-white text-black" : "text-[#c7d5e8]"}`}>RU</button>
      <button type="button" onClick={() => setLocale("en")} className={`rounded-full px-3 py-1.5 text-xs ${locale === "en" ? "bg-white text-black" : "text-[#c7d5e8]"}`}>EN</button>
    </div>
  );
}
