import {
  createInitialBondingState,
  grossTonForBuyingTokens,
  graduationPreview,
  normalizeCreatorTax,
  quoteBuy,
  quoteSell,
  roundNumber
} from "@meme-launchpad/shared";
import { BondingCurveContract } from "../contracts/bonding/BondingCurveContract";

const tax = normalizeCreatorTax({ mode: "normal" });

const printState = (label: string, state: ReturnType<typeof createInitialBondingState>) => {
  console.log(`\n[${label}]`);
  console.log(`token sold: ${state.soldSupply.toFixed(2)}`);
  console.log(`reserve TON: ${state.reserveTon.toFixed(6)}`);
  console.log(`price: ${state.currentPriceTon.toFixed(12)} TON`);
  console.log(`market cap: ${state.marketCapTon.toFixed(4)} TON`);
  console.log(`graduation point: ${(state.progress * 100).toFixed(2)}%`);
  console.log(`expected STON.fi pool ratio: ${state.expectedPoolRatioTon.toFixed(12)} TON/token`);
};

const runBuy = (state: ReturnType<typeof createInitialBondingState>, ton: number) =>
  quoteBuy(state, ton, tax).newState;

const runSell = (state: ReturnType<typeof createInitialBondingState>, tokens: number) =>
  quoteSell(state, tokens, tax).newState;

let state = createInitialBondingState(new Date("2026-05-05T00:00:00.000Z"));

for (let index = 0; index < 100; index += 1) {
  const grossTon = grossTonForBuyingTokens(state, 4_000_000, tax);
  state = runBuy(state, grossTon);
}
printState("100 buys", state);

const sellChunk = (state.soldSupply * 0.22) / 100;
for (let index = 0; index < 100; index += 1) {
  state = runSell(state, sellChunk);
}
printState("100 sells", state);

state = createInitialBondingState(new Date("2026-05-05T00:00:00.000Z"));
state = runBuy(state, grossTonForBuyingTokens(state, 120_000_000, tax));
printState("Whale buy", state);

state = runBuy(state, grossTonForBuyingTokens(state, 80_000_000, tax));
state = runSell(state, state.soldSupply * 0.45);
printState("Whale sell", state);

state = createInitialBondingState(new Date("2026-05-05T00:00:00.000Z"));
while (state.progress < 0.975) {
  const grossTon = grossTonForBuyingTokens(
    state,
    Math.min(state.remainingBondingSupply, 10_000_000),
    tax
  );
  state = runBuy(state, grossTon);
}
printState("Near graduation", state);

while (!state.canGraduate) {
  const grossTon = grossTonForBuyingTokens(
    state,
    Math.min(state.remainingBondingSupply, 2_000_000),
    tax
  );
  state = runBuy(state, grossTon);
}
printState("Exact graduation threshold", state);

const graduation = graduationPreview(state);
console.log("\n[Graduation settlement]");
console.log(`reserve before: ${graduation.reserveBeforeTon.toFixed(6)} TON`);
console.log(`graduation fee: ${graduation.graduationFeeTon.toFixed(2)} TON`);
console.log(`creator refund: ${graduation.creatorRefundTon.toFixed(2)} TON`);
console.log(`liquidity TON: ${graduation.reserveAfterTon.toFixed(6)} TON`);
console.log(`liquidity tokens: ${graduation.liquidityTokens.toFixed(0)}`);
console.log(`pool ratio: ${graduation.poolRatioTon.toFixed(12)} TON/token`);

const contract = new BondingCurveContract(tax);
contract.state = state;
contract.status = "GRADUATED";

try {
  contract.buy(1);
} catch (error) {
  console.log("\n[Post graduation]");
  console.log(`buy blocked after graduation: ${(error as Error).message}`);
}

console.log(
  `\nSummary: final sold supply ${roundNumber(state.soldSupply, 2)} with reserve ${roundNumber(
    state.reserveTon,
    6
  )} TON.`
);
