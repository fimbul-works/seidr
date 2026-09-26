import { resolve } from "node:path";
import { defineConfig, type UserConfig } from "vite";
import { seidrVitePlugin } from "./src/build-plugins/index.ts";

export default defineConfig(() => {
  return {
    root: "examples/ssr",
    publicDir: resolve(import.meta.dirname, "public"),
    plugins: [seidrVitePlugin()],
    resolve: {
      alias: {
        "@fimbul-works/seidr/router": resolve(import.meta.dirname, "./src/router/index.ts"),
        "@fimbul-works/seidr/html": resolve(import.meta.dirname, "./src/elements/index.ts"),
        "@fimbul-works/seidr/ssr": resolve(import.meta.dirname, "./src/index.ssr.ts"),
        "@fimbul-works/seidr": resolve(import.meta.dirname, "./src/index.ts"),
      },
    },
    ssr: {
      noExternal: ["@fimbul-works/seidr"],
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      target: "esnext",
      rolldownOptions: {
        input: resolve("examples", "ssr", "index.html"),
        output: {
          format: "es",
          entryFileNames: () => "[name].js",
        },
        treeshake: true,
        external: ["node:fs", "node:path", "node:async_hooks"],
      },
    },
  } as UserConfig;
});
