import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createDemoSnapshot } from "@meme-launchpad/shared";

const output = path.resolve(process.cwd(), "data", "launchpad-local.json");

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(createDemoSnapshot(), null, 2), "utf8");

console.log(`Seeded demo snapshot at ${output}`);
