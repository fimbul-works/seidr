import { resolve } from "node:path";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { defineConfig, type UserConfig } from "vite";

export default defineConfig({
  publicDir: resolve(import.meta.dirname, "../../public"),
  plugins: [seidrVitePlugin()],
  ssr: {
    noExternal: ["@fimbul-works/seidr", "@fimbul-works/seidr-router", "@fimbul-works/seidr-random"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    modulePreload: { polyfill: false },
    minify: "esbuild",
    target: "esnext",
    rollupOptions: {
      input: {
        blog: resolve(import.meta.dirname, "index.html"),
      },
      output: {
        format: "es",
        entryFileNames: () => "[name].js",
      },
      treeshake: true,
      external: ["node:fs", "node:path", "node:async_hooks"],
    },
  },
} as UserConfig);
