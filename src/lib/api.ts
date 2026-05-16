import type {
  ClaimResponse,
  CreateTokenInput,
  TokenRecord,
  TradeRecord,
  UserSummary
} from "./shared";

const resolveApiBase = (): string => {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  // Same-domain Next.js API routes
  return typeof window === "undefined" ? "" : "";
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
  requestJson<TokenRecord[]>(`/api/${filter === "trending" ? "" : "?filter=" + filter}tokens`).catch(
    () => requestJson<TokenRecord[]>(`/api/tokens?filter=${filter}`)
  );

export const getTokenList = (filter = "trending") =>
  requestJson<TokenRecord[]>(`/api/tokens?filter=${filter}`);

export const getToken = (id: string) =>
  requestJson<{ token: TokenRecord; shareUrl: string }>(`/api/tokens/${id}`);

export const getTrades = (id: string) =>
  requestJson<TradeRecord[]>(`/api/tokens/${id}/trades`);

export const createToken = (input: CreateTokenInput) =>
  requestJson<TokenRecord>("/api/tokens", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const buyToken = (
  id: string,
  wallet: string,
  tonAmount: number,
  referralCode?: string,
  slippageBps = 500
) =>
  requestJson(`/api/tokens/${id}/buy`, {
    method: "POST",
    body: JSON.stringify({ wallet, tonAmount, referralCode, slippageBps })
  });

export const sellToken = (
  id: string,
  wallet: string,
  tokenAmount: number,
  referralCode?: string,
  slippageBps = 500
) =>
  requestJson(`/api/tokens/${id}/sell`, {
    method: "POST",
    body: JSON.stringify({ wallet, tokenAmount, referralCode, slippageBps })
  });

export const resolveReferral = (wallet: string, code?: string) =>
  requestJson("/api/referral/resolve", {
    method: "POST",
    body: JSON.stringify({ wallet, code })
  });

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
