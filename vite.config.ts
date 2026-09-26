import { resolve } from "path";
import { defineConfig, type UserConfig } from "vite";
import { seidrVitePlugin } from "./src/build-plugins/index.ts";

export default defineConfig(() => {
  const example = process.env.EXAMPLE;
  const input = example ? `examples/${example}/index.html` : "examples/index.html";
  const output = example
    ? {
        format: "es",
        entryFileNames: `${example}.js`,
        codeSplitting: false,
      }
    : {};
  return {
    root: "examples",
    publicDir: resolve(import.meta.dirname, "public"),
    plugins: [seidrVitePlugin({ disableSSR: true })],
    resolve: {
      alias: {
        "@fimbul-works/seidr/router": resolve(import.meta.dirname, "./src/router/index.ts"),
        "@fimbul-works/seidr/html": resolve(import.meta.dirname, "./src/elements/index.ts"),
        "@fimbul-works/seidr/ssr": resolve(import.meta.dirname, "./src/index.ssr.ts"),
        "@fimbul-works/seidr": resolve(import.meta.dirname, "./src/index.ts"),
      },
    },
    build: {
      outDir: "build",
      emptyOutDir: false,
      minify: false,
      sourcemap: false,
      modulePreload: { polyfill: false },
      target: "chrome107",
      rolldownOptions: {
        input,
        output,
        context: "window",
        treeshake: true,
        optimization: {
          inlineConst: true,
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
