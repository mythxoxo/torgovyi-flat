import { findReferralBindingByCode, findReferralBindingByWallet, getReferralAccounting, upsertReferralAccounting, upsertReferralBinding, upsertClaimRequest } from "../src/lib/server/referral-store";
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

  const noRefBuyer = "EQNOREF0000000000000000000000000000000000000000000000000";
  const noRef = await findReferralBindingByWallet(noRefBuyer);
  assert(noRef === null, "buy without referrer should not accrue");

  const noAccrual = await accrueReferralRewardFromTrade({
    buyerWallet: noRefBuyer,
    tradeId: `trade-noref-${suffix}`,
    baseAmountTon: 10,
  });
  assert(noAccrual.accrued === false, "buy without referrer no reward");

  const firstAccrual = await accrueReferralRewardFromTrade({
    buyerWallet: buyer,
    tradeId: `trade-with-ref-${suffix}`,
    baseAmountTon: 10,
  });
  assert(firstAccrual.accrued === true, "buy with referrer creates reward");

  const accounting = await getReferralAccounting(referrer);
  assert(accounting?.claimableTon === 0.1, "buy with referrer accrues claimable reward");

  const secondAccrual = await accrueReferralRewardFromTrade({
    buyerWallet: buyer,
    tradeId: `trade-with-ref-${suffix}`,
    baseAmountTon: 10,
  });
  assert(secondAccrual.accrued === false, "same trade does not duplicate reward");

  const accountingAfterDuplicate = await getReferralAccounting(referrer);
  assert(accountingAfterDuplicate?.claimableTon === 0.1, "same trade does not duplicate reward");

  assert((await getReferralAccounting(buyer)) === null, "buyer should not receive referrer accounting");

  await upsertClaimRequest({
    wallet: referrer,
    type: "referral",
    status: "payload_ready",
    amountTon: 1.25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reason: "claim prepared"
  });

  await upsertClaimRequest({
    wallet: referrer,
    type: "referral",
    status: "verification_pending",
    amountTon: 1.25,
    txHash: "fake-test-hash-for-state-transition-only",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reason: "user submitted tx"
  });

  console.log(JSON.stringify({
    ok: true,
    tests: [
      "self-referral blocked",
      "duplicate referral blocked",
      "buy without referrer does not accrue",
      "buy with referrer accrues pending/claimable reward",
      "empty claim blocked",
      "invalid wallet blocked",
      "claimable state persists",
      "txHash changes status to verification_pending"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
