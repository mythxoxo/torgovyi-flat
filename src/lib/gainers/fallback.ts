import type { GainerRecord } from "./types";

export function listFallbackGainers(): GainerRecord[] {
  const updatedAt = new Date().toISOString();
  return [
    { wallet: "UQ...7F2a", token: "First launch", multiple: 8.4, entryGram: 112, valueGram: 941, source: "fallback", updatedAt },
    { wallet: "UQ...9Bb1", token: "Fresh mem", multiple: 6.9, entryGram: 84, valueGram: 580, source: "fallback", updatedAt },
    { wallet: "UQ...3C0d", token: "Blue chip", multiple: 5.2, entryGram: 210, valueGram: 1092, source: "fallback", updatedAt }
  ];
}
