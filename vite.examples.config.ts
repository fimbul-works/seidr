import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "vite";
import seidr from "./src/build-plugins";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    plugins: [seidr({ disableSSR: true })],
    resolve: {
      alias: {
        "@fimbul-works/seidr/html": resolve(__dirname, "./src/elements/index.ts"),
        "@fimbul-works/seidr/ssr": resolve(__dirname, "./src/index.ssr.ts"),
        "@fimbul-works/seidr": resolve(__dirname, "./src/index.ts"),
      },
    },
    build: {
      outDir: "examples/build",
      emptyOutDir: true,
      minify: "terser",
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
