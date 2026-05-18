import { execSync } from "node:child_process";

const run = (cmd: string) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

run("npm run check:security");
run("npm run check:manifest");
run("npm run build");

console.log(JSON.stringify({ ok: true }, null, 2));
