import { execSync, spawn } from "node:child_process";

const entries = [
  { input: "build/types-raw/index.client.d.ts", output: "dist/seidr.d.ts" },
  { input: "build/types-raw/index.server.d.ts", output: "dist/seidr.server.d.ts" },
  { input: "build/types-raw/index.core.d.ts", output: "dist/seidr.core.d.ts" },
  { input: "build/types-raw/test-setup/index.d.ts", output: "dist/testing.d.ts" },
];

console.log("⏳ Emitting raw declarations...");
execSync("tsc -p tsconfig.declarations.json", { stdio: "inherit" });
console.log("✅ Raw declarations emitted\n");

console.log("⏳ Bundling declarations...");

const results = await Promise.allSettled(
  entries.map(
    ({ input, output }) =>
      new Promise<void>((resolve, reject) => {
        const proc = spawn("dts-bundle-generator", ["--out-file", output, "--no-check", input], { stdio: "inherit" });
        proc.on("close", (code) =>
          code === 0 ? resolve() : reject(new Error(`dts-bundle-generator failed for ${input}`)),
        );
      }),
  ),
);

let failed = false;
for (const [i, result] of results.entries()) {
  if (result.status === "rejected") {
    console.error(`❌ ${entries[i].input}: ${result.reason.message}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("✅ All declaration bundles written");
