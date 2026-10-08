import { resolve } from "node:path";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { defineConfig, type UserConfig } from "vite";

export default defineConfig({
  publicDir: resolve(import.meta.dirname, "../../public"),
  plugins: [seidrVitePlugin({ disableSSR: true })],
  server: {
    port: 3000,
    open: "/index.html",
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
} as UserConfig);
