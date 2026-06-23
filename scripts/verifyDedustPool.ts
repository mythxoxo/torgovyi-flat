import { verifyListingPool } from "../src/lib/server/dedust-verifier";

const args = process.argv.slice(2);
const i = args.indexOf('--pool');
const pool = i >= 0 ? args[i + 1] : undefined;
if (!pool) throw new Error('--pool is required');

verifyListingPool(pool)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
