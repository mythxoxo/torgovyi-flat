"use client";

import { useEffect } from "react";
import { getTelegramWebApp } from "../lib/telegram";

export function TelegramBoot() {
  useEffect(() => {
    const app = getTelegramWebApp();
    if (!app) return;
    app.ready();
    app.expand();
    app.setHeaderColor?.("#0a0f1a");
  }, []);

  return null;
}
