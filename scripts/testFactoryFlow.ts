import { Blockchain } from "@ton/sandbox";
import { beginCell } from "@ton/core";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

async function expectThrow(label: string, run: () => Promise<unknown>) {
  try {
    await run();
    throw new Error(`${label}: expected throw`);
  } catch {
    return true;
  }
}

async function main() {
  const blockchain = await Blockchain.create();
  blockchain.verbosity.print = false;

  const owner = await blockchain.treasury("owner");
  const creator = await blockchain.treasury("creator");
  const stranger = await blockchain.treasury("stranger");
  const pool = await blockchain.treasury("pool");
  const jetton = await blockchain.treasury("jetton");
  const pool2 = await blockchain.treasury("pool2");
  const jetton2 = await blockchain.treasury("jetton2");

  const factory = blockchain.openContract(await LaunchpadFactory.fromInit(owner.address));

  await factory.send(
    creator.getSender(),
    { value: 100000000n },
    {
      $$type: "CreateToken",
      name: "Launch One",
      symbol: "L1",
      description: "first",
      imageUrl: "",
      totalSupply: 1n,
      creator: creator.address,
      curveTarget: 5000000000n,
      minBuy: 50000000n,
      feeBps: 75n,
    }
  );

  const launchCount = await factory.getGetLaunchCount();
  const launchId = await factory.getGetCreatorLaunchId(creator.address);
  const launch = await factory.getGetLaunchRecord(launchId);

  if (launchCount !== 1n) throw new Error("valid create launch failed");
  if (launch.creator.toString() !== creator.address.toString()) throw new Error("launch creator mismatch");
  if (launch.hasPool !== false || launch.hasToken !== false) throw new Error("initial launch state mismatch");

  await expectThrow("invalid owner", async () => {
    await factory.send(
      stranger.getSender(),
      { value: 100000000n },
      {
        $$type: "CreateToken",
        name: "Bad",
        symbol: "BAD",
        description: "bad",
        imageUrl: "",
        totalSupply: 1n,
        creator: creator.address,
        curveTarget: 5000000000n,
        minBuy: 50000000n,
        feeBps: 75n,
      }
    );
  });

  await expectThrow("duplicate launch", async () => {
    await factory.send(
      creator.getSender(),
      { value: 100000000n },
      {
        $$type: "CreateToken",
        name: "Launch Duplicate",
        symbol: "L2",
        description: "dup",
        imageUrl: "",
        totalSupply: 1n,
        creator: creator.address,
        curveTarget: 5000000000n,
        minBuy: 50000000n,
        feeBps: 75n,
      }
    );
  });

  await expectThrow("wrong sender", async () => {
    await factory.send(
      stranger.getSender(),
      { value: 100000000n },
      {
        $$type: "RegisterPool",
        pool: pool.address,
        jettonMaster: jetton.address,
        creator: creator.address,
      }
    );
  });

  await factory.send(
    creator.getSender(),
    { value: 100000000n },
    {
      $$type: "RegisterPool",
      pool: pool.address,
      jettonMaster: jetton.address,
      creator: creator.address,
    }
  );

  const poolCount = await factory.getGetPoolCount();
  const registeredPool = await factory.getGetPoolAddress(0n);
  const registeredJetton = await factory.getGetPoolJetton(0n);
  const registeredCreator = await factory.getGetPoolCreator(0n);
  const storedLaunch = await factory.getGetLaunchRecord(launchId);
  const poolRegistered = await factory.getIsPoolRegistered(pool.address);
  const jettonRegistered = await factory.getIsJettonRegistered(jetton.address);

  if (poolCount !== 1n) throw new Error("pool count mismatch");
  if (registeredPool.toString() !== pool.address.toString()) throw new Error("registered pool mismatch");
  if (registeredJetton.toString() !== jetton.address.toString()) throw new Error("registered jetton mismatch");
  if (registeredCreator.toString() !== creator.address.toString()) throw new Error("registered creator mismatch");
  if (!storedLaunch.hasPool || !storedLaunch.hasToken) throw new Error("storage consistency failed");
  if (!poolRegistered || !jettonRegistered) throw new Error("registration lookup failed");

  await expectThrow("duplicate pool", async () => {
    await factory.send(
      creator.getSender(),
      { value: 100000000n },
      {
        $$type: "RegisterPool",
        pool: pool.address,
        jettonMaster: jetton2.address,
        creator: creator.address,
      }
    );
  });

  await expectThrow("duplicate token", async () => {
    await factory.send(
      creator.getSender(),
      { value: 100000000n },
      {
        $$type: "RegisterPool",
        pool: pool2.address,
        jettonMaster: jetton.address,
        creator: creator.address,
      }
    );
  });

  console.log(JSON.stringify({
    ok: true,
    tests: [
      "valid create launch",
      "invalid owner",
      "duplicate launch",
      "duplicate pool",
      "wrong sender",
      "storage consistency"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
