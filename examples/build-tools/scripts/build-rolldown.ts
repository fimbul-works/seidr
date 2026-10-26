import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { seidrRolldownPlugin } from "@fimbul-works/seidr-build-tools/rolldown";
import { rolldown } from "rolldown";

const rootDir = resolve(import.meta.dirname, "..");
const outDir = resolve(rootDir, "dist/rolldown");

console.log("==> Building with Rolldown...");
await rm(outDir, { recursive: true, force: true });

// 1. Build client bundle with Rolldown
console.log("--> Rolldown: Building client bundle...");
const clientBundle = await rolldown({
  input: resolve(rootDir, "src/entry-client.ts"),
  plugins: [seidrRolldownPlugin({ target: "browser" })],
});

await clientBundle.write({
  file: resolve(outDir, "client.js"),
  format: "es",
  sourcemap: false,
});

// 2. Build server bundle with Rolldown
console.log("--> Rolldown: Building server bundle...");
const serverBundle = await rolldown({
  input: resolve(rootDir, "src/entry-server.ts"),
  plugins: [seidrRolldownPlugin({ target: "ssr" })],
  external: ["node:fs", "node:path", "node:async_hooks"],
});

await serverBundle.write({
  file: resolve(outDir, "server.js"),
  format: "es",
  sourcemap: false,
});

console.log("✓ Rolldown client and server builds completed successfully into:", outDir);
