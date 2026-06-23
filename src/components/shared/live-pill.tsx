import { getLiveProof } from "../../lib/server/live-proof";

export async function LivePill() {
  const live = await getLiveProof();

  if (live.summary.liveBuyProven) {
    return <span>Live buy proven on mainnet</span>;
  }

  return <span>Mainnet proof in progress</span>;
}
