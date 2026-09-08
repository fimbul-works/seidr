import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "vite";
import seidr from "./src/build-plugins/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    root: "examples/ssr",
    plugins: [seidr()],
    resolve: {
      alias: {
        "@fimbul-works/seidr/router": resolve(__dirname, "./src/router/index.ts"),
        "@fimbul-works/seidr/html": resolve(__dirname, "./src/elements/index.ts"),
        "@fimbul-works/seidr/ssr": resolve(__dirname, "./src/index.ssr.ts"),
        "@fimbul-works/seidr": resolve(__dirname, "./src/index.ts"),
      },
    },
    ssr: {
      noExternal: ["@fimbul-works/seidr"],
    },
    build: {
      outDir: "examples/ssr/dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      target: "esnext",
      rolldownOptions: {
        input: resolve("examples", "ssr", "index.html"),
        output: {
          dir: "examples/ssr/dist",
          format: "es",
          entryFileNames: () => "[name].js",
        },
        treeshake: true,
        external: ["node:fs", "node:path", "node:async_hooks"],
      },
    },
  } as UserConfig;
});
