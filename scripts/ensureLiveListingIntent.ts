import { ensureLivePoolListingIntent } from "../src/lib/server/dedust-verifier";

ensureLivePoolListingIntent()
  .then((result) => {
    console.log(JSON.stringify({ ok: true, intent: result }, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
