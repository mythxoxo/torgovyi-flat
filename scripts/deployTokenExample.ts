import { beginCell, Address, toNano } from "@ton/core";
import { storeCreateToken } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

async function main() {
  const factory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  const creator = process.env.EXAMPLE_CREATOR_ADDRESS;
  if (!factory || !creator) {
    throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS and EXAMPLE_CREATOR_ADDRESS are required");
  }

  const body = beginCell().store(storeCreateToken({
    $$type: "CreateToken",
    name: "Example Meme",
    symbol: "EXM",
    description: "Example create payload",
    imageUrl: "https://torgovyi-flat.vercel.app/icon.svg",
    totalSupply: 1000000000n,
    creator: Address.parse(creator),
    curveTarget: 8888000000000n,
    minBuy: 50000000n,
    feeBps: 75n
  })).endCell().toBoc().toString("base64");

  console.log(JSON.stringify({
    address: factory,
    amount: toNano("0.35").toString(),
    payload: body
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
