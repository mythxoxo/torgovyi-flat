import { calculatePlatformFeeUnits, subtractFeeUnits } from "../src/lib/dex/external/fees";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const fee = calculatePlatformFeeUnits("1000000000", 25);
const net = subtractFeeUnits("1000000000", fee);

assert(fee === "2500000", "fee mismatch");
assert(net === "997500000", "net mismatch");

console.log(JSON.stringify({ ok: true, fee, net }, null, 2));
