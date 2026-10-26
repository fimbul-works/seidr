import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import babel from "@babel/core";
import { seidrBabelPlugin } from "@fimbul-works/seidr-build-tools/babel";

const rootDir = resolve(import.meta.dirname, "..");
const outDir = resolve(rootDir, "dist/babel");

console.log("==> Building with Babel...");
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// 1. Transform client with Babel
console.log("--> Babel: Transforming client source...");
const clientSource = await readFile(resolve(rootDir, "src/isomorphic-app.ts"), "utf-8");
const clientTransformed = await babel.transformAsync(clientSource, {
  configFile: false,
  babelrc: false,
  filename: "isomorphic-app.ts",
  presets: ["@babel/preset-typescript"],
  plugins: [[seidrBabelPlugin, { target: "browser" }]],
});

await writeFile(resolve(outDir, "isomorphic-app.client.js"), clientTransformed?.code || "", "utf-8");

// 2. Transform server with Babel
console.log("--> Babel: Transforming server source...");
const serverSource = await readFile(resolve(rootDir, "src/isomorphic-app.ts"), "utf-8");
const serverTransformed = await babel.transformAsync(serverSource, {
  configFile: false,
  babelrc: false,
  filename: "isomorphic-app.ts",
  presets: ["@babel/preset-typescript"],
  plugins: [[seidrBabelPlugin, { target: "ssr" }]],
});

await writeFile(resolve(outDir, "isomorphic-app.server.js"), serverTransformed?.code || "", "utf-8");

console.log("✓ Babel client and server transforms completed successfully into:", outDir);
