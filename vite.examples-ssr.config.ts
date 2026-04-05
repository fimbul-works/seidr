import { resolve } from "node:path";
import replace from "@rollup/plugin-replace";
import { defineConfig, type UserConfig } from "vite";
import { treeshake } from "./build.shared.ts";

export default defineConfig((config) => {
  return {
    root: "examples/ssr",
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.DISABLE_SSR": "false",
        "process.env.VITEST": "false",
        "process.env.USE_SCHEDULER": config.isSsrBuild ? "true" : "false",
        "process.env.DEBUG": "true",
        "process.env.DEBUG_HYDRATION": "true",
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
