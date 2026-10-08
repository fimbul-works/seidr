import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loiskeVitePlugin } from "@fimbul-works/loiske/build";
import { build } from "vite";

const rootDir = import.meta.dirname;
const distDir = resolve(rootDir, "dist");
const publicDir = resolve(rootDir, "../../public");

console.log("Building Loiske particle shader...");

await build({
  configFile: false,
  root: rootDir,
  publicDir: false,
  plugins: [loiskeVitePlugin({ compress: true, stripTransforms: true })],
  build: {
    outDir: distDir,
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    target: "chrome107",
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: resolve(rootDir, "particles.ts"),
      output: {
        format: "es",
        entryFileNames: "particles.js",
        codeSplitting: false,
      },
      treeshake: true,
    },
  },
  esbuild: {
    drop: ["debugger"],
  },
});

await mkdir(publicDir, { recursive: true });
await copyFile(resolve(distDir, "particles.js"), resolve(publicDir, "particles.js"));
console.log("Successfully built and copied to public/particles.js");
