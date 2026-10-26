import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { build } from "vite";

const rootDir = resolve(import.meta.dirname, "..");
const outDir = resolve(rootDir, "dist/vite");

console.log("==> Building with Vite...");
await rm(outDir, { recursive: true, force: true });

// 1. Build client bundle with Vite
console.log("--> Vite: Building client bundle...");
await build({
  configFile: false,
  root: rootDir,
  plugins: [seidrVitePlugin({ target: "browser" })],
  build: {
    outDir,
    emptyOutDir: false,
    lib: {
      entry: resolve(rootDir, "src/entry-client.ts"),
      formats: ["es"],
      fileName: () => "client.js",
    },
    minify: false,
    sourcemap: false,
    rollupOptions: {
      external: ["node:fs", "node:path", "node:async_hooks"],
    },
  },
});

// 2. Build server bundle with Vite
console.log("--> Vite: Building server bundle...");
await build({
  configFile: false,
  root: rootDir,
  plugins: [seidrVitePlugin({ target: "ssr" })],
  build: {
    outDir,
    emptyOutDir: false,
    ssr: resolve(rootDir, "src/entry-server.ts"),
    minify: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "server.js",
      },
    },
  },
});

console.log("✓ Vite client and server builds completed successfully into:", outDir);
