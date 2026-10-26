import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { seidrEsbuildPlugin } from "@fimbul-works/seidr-build-tools/esbuild";
import esbuild from "esbuild";

const rootDir = resolve(import.meta.dirname, "..");
const outDir = resolve(rootDir, "dist/esbuild");

console.log("==> Building with Esbuild...");
await rm(outDir, { recursive: true, force: true });

// 1. Build client bundle with Esbuild
console.log("--> Esbuild: Building client bundle...");
await esbuild.build({
  entryPoints: [resolve(rootDir, "src/entry-client.ts")],
  bundle: true,
  outfile: resolve(outDir, "client.js"),
  format: "esm",
  platform: "browser",
  plugins: [seidrEsbuildPlugin({ target: "browser" })],
  minify: false,
  sourcemap: false,
});

// 2. Build server bundle with Esbuild
console.log("--> Esbuild: Building server bundle...");
await esbuild.build({
  entryPoints: [resolve(rootDir, "src/entry-server.ts")],
  bundle: true,
  outfile: resolve(outDir, "server.js"),
  format: "esm",
  platform: "node",
  external: ["node:fs", "node:path", "node:async_hooks"],
  plugins: [seidrEsbuildPlugin({ target: "ssr" })],
  minify: false,
  sourcemap: false,
});

console.log("✓ Esbuild client and server builds completed successfully into:", outDir);
