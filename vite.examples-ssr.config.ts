import { resolve } from "node:path";
import replace from "@rollup/plugin-replace";
import { defineConfig, type UserConfig } from "vite";
import { mainReplace, treeshake } from "./build.shared.ts";

export default defineConfig((config) => {
  return {
    root: "examples/ssr",
    plugins: [
      replace({
        ...mainReplace,
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.USE_SCHEDULER": config.isSsrBuild ? true : undefined,
        "process.env.SSR": config.isSsrBuild ? true : undefined,
        __SEIDR_DEV__: "false",
        preventAssignment: true,
      }),
    ],
    ssr: {
      noExternal: ["@fimbul-works/seidr"],
    },
    build: {
      outDir: "examples/ssr/dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      target: "esnext",
      rollupOptions: {
        input: resolve("examples/ssr", "index.html"),
        output: {
          dir: "examples/ssr/dist",
          format: "es",
          entryFileNames: `index.html`,
          inlineDynamicImports: false,
        },
        treeshake,
      },
    },
  } as UserConfig;
});
