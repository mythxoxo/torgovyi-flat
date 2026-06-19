import type { TokenRecord } from "../lib/shared";
import { TokenCard } from "./token-card";

export function LaunchpadTokenCard({ token }: { token: TokenRecord }) {
  return (
    <TokenCard token={token} />
  );
}
