export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  openTelegramLink?: (url: string) => void;
  initDataUnsafe?: {
    start_param?: string;
    user?: {
      photo_url?: string;
    };
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
  typeof window === "undefined" ? undefined : window.Telegram?.WebApp;
