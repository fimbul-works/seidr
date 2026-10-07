import { resolve } from "node:path";
import { loiskeVitePlugin } from "@fimbul-works/loiske/build";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { defineConfig, type UserConfig } from "vite";

export default defineConfig({
  publicDir: resolve(import.meta.dirname, "../../public"),
  plugins: [seidrVitePlugin({ disableSSR: true }), loiskeVitePlugin({ compress: true, stripTransforms: true })],
  server: {
    port: 3000,
    open: "/index.html",
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
} as UserConfig);
