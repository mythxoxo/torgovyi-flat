"use client";

import { useUi } from "./page-shell";

export function LanguageSwitcher() {
  const { locale, setLocale } = useUi();
  const active = "bg-[#2aabee] text-[#06101a]";
  const idle = "text-[#c7d5e8]";
  return (
    <div className="rounded-full border border-white/8 bg-white/5 p-1">
      <button type="button" onClick={() => setLocale("ru")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${locale === "ru" ? active : idle}`}>RU</button>
      <button type="button" onClick={() => setLocale("en")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${locale === "en" ? active : idle}`}>EN</button>
    </div>
  );
}
