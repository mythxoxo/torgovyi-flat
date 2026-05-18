"use client";

import { useEffect } from "react";

import { getTelegramWebApp } from "../lib/telegram";

export function TelegramBoot() {
  useEffect(() => {
    const webApp = getTelegramWebApp();
    webApp?.ready();
    webApp?.expand();
    webApp?.setHeaderColor?.("#050b14");
  }, []);

  return null;
}
