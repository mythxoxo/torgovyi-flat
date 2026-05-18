import { Address } from "@ton/core";
import { LaunchpadFactory } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

const FALLBACK_OWNER = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

async function main() {
  const owner = Address.parse(process.env.FACTORY_OWNER_ADDRESS || FALLBACK_OWNER);
  const factory = await LaunchpadFactory.fromInit(owner);

  console.log(JSON.stringify({
    ok: true,
    kind: "factory-tonconnect-prep",
    owner: owner.toString({ bounceable: true, testOnly: false }),
    factoryAddress: factory.address.toString({ bounceable: true, testOnly: false }),
    note: "Use this derived address for pre-funding / live deployment planning."
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
