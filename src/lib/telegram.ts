export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  setHeaderColor?(color: string): void;
  initDataUnsafe?: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
    };
    start_param?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export const getTelegramWebApp = (): TelegramWebApp | undefined =>
  typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

export const getTelegramUser = () => getTelegramWebApp()?.initDataUnsafe?.user;

export const getTelegramStartParam = (): string | undefined =>
  getTelegramWebApp()?.initDataUnsafe?.start_param;
