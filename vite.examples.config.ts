import { resolve } from "path";
import { defineConfig, type UserConfig } from "vite";
import seidr from "./src/build-plugins/index.ts";

export default defineConfig(() => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    publicDir: resolve(import.meta.dirname, "public"),
    plugins: [seidr({ disableSSR: true })],
    resolve: {
      alias: {
        "@fimbul-works/seidr/router": resolve(import.meta.dirname, "./src/router/index.ts"),
        "@fimbul-works/seidr/html": resolve(import.meta.dirname, "./src/elements/index.ts"),
        "@fimbul-works/seidr/ssr": resolve(import.meta.dirname, "./src/index.ssr.ts"),
        "@fimbul-works/seidr": resolve(import.meta.dirname, "./src/index.ts"),
      },
    },
    build: {
      outDir: "examples/build",
      emptyOutDir: true,
      minify: false,
      target: "chrome107",
      rolldownOptions: {
        input: `examples/${example}.ts`,
        output: {
          dir: "examples/build",
          format: "es",
          entryFileNames: `${example}.js`,
          codeSplitting: false,
        },
        context: "window",
        treeshake: true,
        optimization: {
          inlineConst: false,
        },
        external: ["node:fs", "node:path", "node:async_hooks"],
      },
    },
    esbuild: {
      drop: ["console", "debugger"],
    },
    server: {
      port: 3000,
      open: "/examples/index.html",
    },
  } as UserConfig;
});
