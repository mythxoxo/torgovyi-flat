import { Address, beginCell } from "@ton/core";
import type { Sender, SenderArguments } from "@ton/core";
import { calculatePlatformFeeUnits, getDexPlatformFeeBps, getDexPlatformFeeTreasury, subtractFeeUnits } from "../external/fees";
import type { DexSwapPayload, DexSwapRequest } from "../external/types";
import { resolveDedustBuyRoute } from "./route";

const validUntil = () => Math.floor(Date.now() / 1000) + 900;

const result = (input: DexSwapRequest, status: DexSwapPayload["status"], reason: string, platformFee = "0", messages: DexSwapPayload["messages"] = []): DexSwapPayload => ({
  dex: "dedust",
  side: input.side,
  status,
  messages,
  validUntil: validUntil(),
  manualSignRequired: true,
  verificationRequired: true,
  platformFee,
  platformFeeBps: getDexPlatformFeeBps(),
  reason
});

type CapturedMessage = SenderArguments;

class CaptureSender implements Sender {
  readonly address: Address;
  readonly messages: CapturedMessage[] = [];

  constructor(address: Address) {
    this.address = address;
  }

  async send(args: SenderArguments): Promise<void> {
    this.messages.push(args);
  }
}

function toTonConnectMessage(message: CapturedMessage) {
  const payload = message.body ? message.body.toBoc().toString("base64") : undefined;
  return {
    address: message.to.toString({ bounceable: true, testOnly: false }),
    amount: message.value.toString(),
    ...(payload ? { payload } : {}),
  };
}

export async function buildDedustSwapPayload(input: DexSwapRequest): Promise<DexSwapPayload> {
  const platformFee = input.side === "buy" ? calculatePlatformFeeUnits(input.amount) : "0";
  const offerAfterFee = input.side === "buy" ? subtractFeeUnits(input.amount, platformFee) : input.amount;

  if (input.side === "buy" && BigInt(offerAfterFee) <= 0n) {
    return result(input, "failed", "amount is too small after platform fee", platformFee);
  }

  if (input.side === "sell") {
    return result(input, "proxy_required_for_sell_fee", "DeDust sell with platform fee needs a PlatformSwapProxy path", "0");
  }

  const route = await resolveDedustBuyRoute(input.tokenAddress);
  if (route.status !== "quote_ready") {
    return result(input, route.status, route.reason || "DeDust route unavailable", platformFee);
  }

  if (!route.vault || !route.poolAddress) {
    return result(input, "payload_unavailable", "vault or pool address missing after route resolution", platformFee);
  }

  const treasury = getDexPlatformFeeTreasury();
  const messages: DexSwapPayload["messages"] = [];
  if (treasury && BigInt(platformFee) > 0n) {
    messages.push({
      address: treasury,
      amount: platformFee,
    });
  }

  try {
    const captureSender = new CaptureSender(Address.parse(input.userWallet));
    await route.vault.sendSwap(captureSender, {
      amount: BigInt(offerAfterFee),
      poolAddress: Address.parse(route.poolAddress),
      swapParams: {
        recipientAddress: Address.parse(input.userWallet),
        fulfillPayload: beginCell().endCell(),
      },
    });

    const captured = captureSender.messages.map(toTonConnectMessage).filter((msg) => msg.address && BigInt(msg.amount) > 0n && msg.payload);
    if (captured.length === 0) {
      return result(input, "payload_unavailable", "sdk_no_build_only_sender", platformFee, messages);
    }

    return {
      dex: "dedust",
      side: input.side,
      status: "payload_ready",
      messages: [...messages, ...captured],
      validUntil: validUntil(),
      manualSignRequired: true,
      verificationRequired: true,
      platformFee,
      platformFeeBps: getDexPlatformFeeBps(),
      reason: `pool=${route.poolAddress} vault=${route.vaultAddress}`,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    if (/429/.test(reason)) {
      return result(input, "dex_rate_limited", reason, platformFee, messages);
    }
    return result(input, "payload_unavailable", "sdk_no_build_only_sender", platformFee, messages);
  }
}
