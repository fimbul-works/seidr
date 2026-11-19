import { resolve } from "node:path";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { defineConfig, type UserConfig } from "vite";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  publicDir: resolve(import.meta.dirname, "../../public"),
  plugins: [seidrVitePlugin({ disableSSR: true })],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: isDev ? "inline" : false,
    modulePreload: { polyfill: false },
    minify: isDev ? false : "esbuild",
    target: "esnext",
    rollupOptions: {
      input: {
        "seidr-ui": resolve(import.meta.dirname, "index.html"),
      },
      output: {
        format: "es",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        codeSplitting: false,
        comments: false,
      },
      treeshake: true,
    },
  },
  esbuild: {
    drop: isDev ? [] : ["console", "debugger"],
  },
  server: {
    port: 3002,
  },
} as UserConfig);
