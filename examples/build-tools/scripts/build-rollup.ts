import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { seidrRollupPlugin } from "@fimbul-works/seidr-build-tools/rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "esbuild";
import { rollup } from "rollup";

const rootDir = resolve(import.meta.dirname, "..");
const outDir = resolve(rootDir, "dist/rollup");

console.log("==> Building with Rollup...");
await rm(outDir, { recursive: true, force: true });

// Plugin to strip TypeScript types after Seidr AST pruning
const tsStripPlugin = {
  name: "strip-typescript",
  transform(code: string, id: string) {
    if (/\.[cm]?[jt]sx?$/.test(id)) {
      const result = esbuild.transformSync(code, {
        loader: id.endsWith(".ts") || id.endsWith(".mts") ? "ts" : "js",
        target: "es2022",
      });
      return { code: result.code, map: null };
    }
    return null;
  },
};

// 1. Build client bundle with Rollup
console.log("--> Rollup: Building client bundle...");
const clientBundle = await rollup({
  input: resolve(rootDir, "src/entry-client.ts"),
  plugins: [
    seidrRollupPlugin({ target: "browser" }) as any,
    tsStripPlugin,
    nodeResolve({
      extensions: [".ts", ".js", ".mjs"],
    }),
  ],
});

await clientBundle.write({
  file: resolve(outDir, "client.js"),
  format: "es",
  sourcemap: false,
});

// 2. Build server bundle with Rollup
console.log("--> Rollup: Building server bundle...");
const serverBundle = await rollup({
  input: resolve(rootDir, "src/entry-server.ts"),
  external: ["node:fs", "node:path", "node:async_hooks"],
  plugins: [
    seidrRollupPlugin({ target: "ssr" }) as any,
    tsStripPlugin,
    nodeResolve({
      extensions: [".ts", ".js", ".mjs"],
    }),
  ],
});

await serverBundle.write({
  file: resolve(outDir, "server.js"),
  format: "es",
  sourcemap: false,
});

console.log("✓ Rollup client and server builds completed successfully into:", outDir);
