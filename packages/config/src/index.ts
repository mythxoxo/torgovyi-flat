export const requiredString = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
};

export const optionalString = (value: string | undefined, fallback = ""): string =>
  value?.trim() ? value.trim() : fallback;

export const numberFromEnv = (value: string | undefined, fallback: number): number => {
  if (!value?.trim()) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected number, received "${value}"`);
  }

  return parsed;
};

export const booleanFromEnv = (value: string | undefined, fallback = false): boolean => {
  if (!value?.trim()) {
    return fallback;
  }

  return value === "1" || value.toLowerCase() === "true";
};

export const isoNow = (): string => new Date().toISOString();

export { loadOptionalEnvFile } from "./env-file.js";
