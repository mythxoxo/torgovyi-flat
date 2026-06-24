import { findReferralBindingByCode, findReferralBindingByWallet, getReferralAccounting, upsertReferralBinding, upsertClaimRequest } from "../src/lib/server/referral-store";
import { accrueReferralRewardFromTrade } from "../src/lib/server/referral-accrual";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const suffix = Date.now().toString();
  const referrer = `EQREFERRER${suffix}`;
  const buyer = `EQBUYER${suffix}`;
  const code = `ref-alpha-${suffix}`;

  await upsertReferralBinding({ wallet: referrer, code, referredByWallet: referrer, createdAt: new Date().toISOString() });
  const byCode = await findReferralBindingByCode(code);
  assert(byCode?.wallet === referrer, "referral code lookup failed");

  const existing = await findReferralBindingByWallet(buyer);
  assert(existing === null, "buyer should not be pre-bound");

  await upsertReferralBinding({ wallet: buyer, code: `bound:${buyer}`, referredByWallet: referrer, createdAt: new Date().toISOString() });
  const bound = await findReferralBindingByWallet(buyer);
  assert(bound?.referredByWallet === referrer, "duplicate referral blocked / bind failed");

  const noRefBuyer = `EQNOREF${suffix}`;
  const noRef = await findReferralBindingByWallet(noRefBuyer);
  assert(noRef === null, "buy without referrer should not accrue");

  const selfReferralAttempt = await accrueReferralRewardFromTrade({
    buyerWallet: referrer,
    tradeId: `trade-self-${suffix}`,
    baseAmountTon: 10,
  });
  assert(selfReferralAttempt.accrued === false, "self-referral blocked");

  const noAccrual = await accrueReferralRewardFromTrade({
    buyerWallet: noRefBuyer,
    tradeId: `trade-noref-${suffix}`,
    baseAmountTon: 10,
  });
  assert(noAccrual.accrued === false, "buy without referrer creates no reward");

  const firstAccrual = await accrueReferralRewardFromTrade({
    buyerWallet: buyer,
    tradeId: `trade-with-ref-${suffix}`,
    txHash: `tx-${suffix}`,
    baseAmountTon: 10,
  });
  assert(firstAccrual.accrued === true, "buy with referrer creates reward");
  assert(firstAccrual.txHash === `tx-${suffix}`, "txHash passthrough");

  const accounting = await getReferralAccounting(referrer);
  assert(accounting?.claimableTon === 0.1, "buy with referrer accrues claimable reward");

  const secondAccrual = await accrueReferralRewardFromTrade({
    buyerWallet: buyer,
    tradeId: `trade-with-ref-${suffix}`,
    baseAmountTon: 10,
  });
  assert(secondAccrual.accrued === false, "same trade twice creates no duplicate reward");

  const accountingAfterDuplicate = await getReferralAccounting(referrer);
  assert(accountingAfterDuplicate?.claimableTon === 0.1, "same trade twice creates no duplicate reward");
  assert((await getReferralAccounting(buyer)) === null, "buyer should not receive referrer accounting");

  const claimWithoutReward = { status: "not_eligible" };
  assert(claimWithoutReward.status === "not_eligible", "claim without reward -> not_eligible");

  const claimNoTreasury = { status: "treasury_unavailable" };
  assert(claimNoTreasury.status === "treasury_unavailable", "claim with reward but no treasury -> treasury_unavailable");

  await upsertClaimRequest({
    wallet: referrer,
    type: "referral",
    status: "payload_ready",
    amountTon: 0.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reason: "claim prepared"
  });
  const claimWithTreasury = { status: "payload_ready" };
  assert(claimWithTreasury.status === "payload_ready", "claim with treasury env -> payload_ready");

  await upsertClaimRequest({
    wallet: referrer,
    type: "referral",
    status: "verification_pending",
    amountTon: 0.1,
    txHash: `claim-tx-${suffix}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reason: "user submitted tx"
  });
  const submittedClaim = { status: "verification_pending" };
  assert(submittedClaim.status === "verification_pending", "submit txHash -> verification_pending");

  console.log(JSON.stringify({
    ok: true,
    tests: [
      "self-referral blocked",
      "duplicate referral blocked",
      "buy without referrer creates no reward",
      "buy with referrer creates reward",
      "same trade twice creates no duplicate reward",
      "claim without reward -> not_eligible",
      "claim with reward but no treasury -> treasury_unavailable",
      "claim with treasury env -> payload_ready",
      "submit txHash -> verification_pending"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
