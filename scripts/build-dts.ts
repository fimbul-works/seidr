import { execSync } from "node:child_process";

const entries = [
  { entry: "src/index.client.ts", out: "dist/seidr.d.ts" },
  { entry: "src/index.server.ts", out: "dist/seidr.server.d.ts" },
  { entry: "src/test-setup/index.ts", out: "dist/seidr.test.d.ts" },
];

for (const { entry, out } of entries) {
  execSync(`npx dts-bundle-generator --out-file ${out} --no-check ${entry}`, { stdio: "inherit" });
}
