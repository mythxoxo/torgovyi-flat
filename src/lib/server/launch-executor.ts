import type { CreateTokenInput } from "../shared";

export async function executeCreateToken(_input: CreateTokenInput) {
  throw new Error("Server-side launch executor is disabled. Token launch must be signed by the user's wallet through TonConnect.");
}
