import type {
  ClaimResponse,
  CreateTokenInput,
  TokenRecord,
  TradeRecord,
  UserSummary
} from "@meme-launchpad/shared";

const resolveApiBase = (): string => {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return typeof window === "undefined" ? "http://localhost:3001" : "";
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveApiBase()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const getTokens = (filter: string): Promise<TokenRecord[]> =>
  requestJson(`/tokens?filter=${encodeURIComponent(filter)}`);

export const getToken = (id: string): Promise<{ token: TokenRecord; shareUrl: string }> =>
  requestJson(`/tokens/${id}`);

export const getTrades = (id: string): Promise<TradeRecord[]> =>
  requestJson(`/tokens/${id}/trades`);

export const getComments = (id: string) =>
  requestJson<Array<{ id: string; author: string; body: string; createdAt: string }>>(`/tokens/${id}/comments`);

export const createToken = (payload: CreateTokenInput): Promise<TokenRecord> =>
  requestJson("/tokens", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const resolveReferral = (
  code: string | undefined,
  wallet: string
): Promise<{
  code: string | null;
  valid: boolean;
  wallet: string | null;
  fallbackToTreasury: boolean;
}> =>
  requestJson("/referral/resolve", {
    method: "POST",
    body: JSON.stringify({ code, wallet })
  });

export const buyToken = (tokenId: string, payload: { wallet: string; tonAmount: number; referralCode?: string; slippageBps?: number }) =>
  requestJson<TokenRecord>(`/tokens/${tokenId}/buy`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const sellToken = (tokenId: string, payload: { wallet: string; tokenAmount: number; referralCode?: string; slippageBps?: number }) =>
  requestJson<TokenRecord>(`/tokens/${tokenId}/sell`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const getUser = (wallet: string): Promise<UserSummary> =>
  requestJson(`/user/${encodeURIComponent(wallet)}`);

export const claimFunds = (payload: {
  wallet: string;
  type: "creator" | "referral" | "refund";
  tokenId?: string;
}): Promise<ClaimResponse> =>
  requestJson("/claim", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const uploadImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${resolveApiBase()}/uploads`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error || `Upload failed: ${response.status}`);
  }

  return (await response.json()) as { url: string };
};
