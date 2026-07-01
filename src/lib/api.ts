import type {
  ClaimResponse,
  CreateTokenInput,
  TokenRecord,
  TradeRecord,
  UserSummary
} from "./shared";

export interface ExternalTokenFeedResponse {
  source: "configured_feed" | "address_list" | "not_configured";
  configured: boolean;
  scannedAt: string;
  tokens: TokenRecord[];
  warning?: string;
}

const resolveApiBase = (): string => {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return configured ? configured.replace(/\/$/, "") : "";
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
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((err as { error?: string }).error ?? response.statusText);
  }

  return response.json() as Promise<T>;
}

export const listTokens = (filter = "trending") =>
  requestJson<TokenRecord[]>(`/api/tokens?filter=${encodeURIComponent(filter)}`);

export const getTokenList = listTokens;

export const getBlumMemepadTokens = (limit = 12, addresses?: string[]) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (addresses?.length) params.set("addresses", addresses.join(","));
  return requestJson<ExternalTokenFeedResponse>(`/api/external/blum?${params.toString()}`);
};

export const getToken = (id: string) =>
  requestJson<{ token: TokenRecord; shareUrl: string }>(`/api/tokens/${id}`);

export const getTrades = (id: string) =>
  requestJson<TradeRecord[]>(`/api/tokens/${id}/trades`);

export const createToken = (input: CreateTokenInput) =>
  requestJson<{ ok: true; pending: true; message: string }>("/api/tokens", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const buyToken = (
  id: string,
  wallet: string,
  tonAmount: number,
  referralCode?: string,
  slippageBps = 500,
  txHash?: string
) =>
  requestJson<{ ok: true; pending: true; message: string }>(`/api/tokens/${id}/buy`, {
    method: "POST",
    body: JSON.stringify({ wallet, tonAmount, referralCode, slippageBps, txHash })
  });

export const sellToken = async () => {
  throw new Error("Sell will be available after bonding/listing through DeDust.");
};

export const resolveReferral = (wallet: string, code?: string) =>
  requestJson<{ code: string | null; valid: boolean; wallet: string | null; fallbackToTreasury: boolean }>(
    "/api/referral/resolve",
    {
      method: "POST",
      body: JSON.stringify({ wallet, code })
    }
  );

export const claimFunds = (body: {
  wallet: string;
  type: "creator" | "referral" | "refund";
  tokenId?: string;
}) =>
  requestJson<ClaimResponse>("/api/claim", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const getUser = (wallet: string) =>
  requestJson<UserSummary>(`/api/user/${wallet}`);

export const uploadTokenImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/uploads", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Image upload failed");
  const data = (await res.json()) as { url: string };
  return data.url;
};
