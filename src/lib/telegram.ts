export interface TelegramWebAppUser {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  setHeaderColor?(color: string): void;
  openTelegramLink(url: string): void;
  showPopup(params: {
    title: string;
    message: string;
    buttons?: Array<{ type: "ok" | "close" | "cancel" | "default"; text?: string; id?: string }>;
  }, callback?: (buttonId: string) => void): void;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick?(cb: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
  };
  initDataUnsafe?: {
    user?: TelegramWebAppUser;
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
