import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  sourcemap: true,
  external: [
    "@aws-sdk/client-s3",
    "cors",
    "express",
    "multer",
    "pg"
  ]
});
