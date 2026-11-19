import { resolve } from "node:path";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { defineConfig, type UserConfig } from "vite";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  publicDir: resolve(import.meta.dirname, "../../public"),
  plugins: [seidrVitePlugin()],
  ssr: {
    noExternal: ["@fimbul-works/seidr", "@fimbul-works/seidr-router", "@fimbul-works/seidr-ui"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: isDev ? "inline" : false,
    modulePreload: { polyfill: false },
    minify: isDev ? false : "esbuild",
    target: "esnext",
    rollupOptions: {
      input: {
        "blog-client": resolve(import.meta.dirname, "index.html"),
      },
      output: {
        format: "es",
        entryFileNames: "assets/[name].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        codeSplitting: false,
        comments: false,
      },
      treeshake: true,
      external: ["node:fs", "node:path", "node:async_hooks"],
    },
  },
  esbuild: {
    drop: isDev ? [] : ["console", "debugger"],
  },
} as UserConfig);
