import { resolve } from "node:path";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { defineConfig, type UserConfig } from "vite";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  publicDir: resolve(import.meta.dirname, "../../public"),
  plugins: [seidrVitePlugin({ disableSSR: true })],
  server: {
    port: 3000,
    open: "/index.html",
  },
  esbuild: {
    drop: isDev ? [] : ["console", "debugger"],
  },
} as UserConfig);
