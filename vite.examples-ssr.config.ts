import { resolve } from "node:path";
import replace from "@rollup/plugin-replace";
import { defineConfig } from "vite";

export default defineConfig((config) => {
  return {
    root: "examples/ssr",
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.CORE_DISABLE_SSR": "false",
        "process.env.VITEST": "false",
        "process.env.USE_SCHEDULER": config.isSsrBuild ? "true" : "false",
        "process.env.DEBUG": "false",
        "isServer()": config.isSsrBuild ? "true" : "false",
        "isClient()": config.isSsrBuild ? "false" : "true",
        preventAssignment: true,
        window: config.isSsrBuild ? "undefined" : "window",
      }),
    ],
    build: {
      outDir: "examples/ssr/dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      target: "esnext",
      rollupOptions: {
        input: resolve("examples/ssr", "entry-client.ts"),
        output: {
          dir: "examples/ssr/dist",
          format: "es",
          entryFileNames: `entry-client.js`,
          inlineDynamicImports: true,
          compact: true,
        },
        treeshake: "smallest",
      },
    },
  };
});
