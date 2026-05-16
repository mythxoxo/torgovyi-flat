"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { UserSummary } from "../../lib/shared";
import { useWallet } from "../../components/wallet-context";
import { claimFunds, getUser } from "../../lib/api";
import { TokenCard } from "../../components/token-card";

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);

  const reload = () => {
    if (!wallet) return;
    void getUser(wallet)
      .then(setUser)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      });
  };

  useEffect(reload, [wallet]);

  const claim = async (type: "creator" | "refund", tokenId?: string) => {
    try {
      setClaiming(true);
      setError("");
      const result = await claimFunds({ wallet, type, tokenId });
      setUser(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-4">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Portfolio</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">My tokens</h2>
      </section>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!wallet ? (
        <div className="card-surface rounded-xl p-4 text-sm text-mist">
          Connect a TON testnet wallet to see your tokens.
        </div>
      ) : !user ? (
        <div className="card-surface rounded-xl p-4 text-sm text-mist">Loading...</div>
      ) : user.createdTokens.length === 0 ? (
        <div className="card-surface rounded-xl p-4 text-sm text-mist">
          You have not created any tokens yet.{" "}
          <Link href="/create" className="text-cyan-300 underline">
            Launch one now →
          </Link>
        </div>
      ) : (
        <>
          {user.creatorClaimableTon > 0 && (
            <div className="card-surface rounded-xl p-4">
              <p className="text-sm text-mist">
                Creator fee claimable: <span className="text-white">{user.creatorClaimableTon.toFixed(3)} TON</span>
              </p>
              <button
                type="button"
                disabled={claiming}
                onClick={() => void claim("creator")}
                className="mt-3 rounded-lg border border-cyan-300/30 px-4 py-2 text-sm text-cyan-200 disabled:opacity-50"
              >
                {claiming ? "Claiming..." : "Claim creator fees"}
              </button>
            </div>
          )}

          <div className="grid gap-3">
            {user.createdTokens.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>

          {user.refunds.filter((r) => r.status === "CLAIMABLE").length > 0 && (
            <div className="card-surface rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-white">Claimable refunds</h3>
              {user.refunds
                .filter((r) => r.status === "CLAIMABLE")
                .map((r) => (
                  <div key={r.tokenId} className="flex items-center justify-between text-sm">
                    <span className="text-mist">{r.tokenId}</span>
                    <button
                      type="button"
                      disabled={claiming}
                      onClick={() => void claim("refund", r.tokenId)}
                      className="rounded border border-white/10 px-3 py-1 text-xs text-cyan-200 disabled:opacity-50"
                    >
                      Claim {r.claimableTon.toFixed(3)} TON
                    </button>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
