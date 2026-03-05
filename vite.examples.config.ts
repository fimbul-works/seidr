import replace from "@rollup/plugin-replace";
import { defineConfig } from "vite";
import { clientReplace } from "./rollup.shared";

export default defineConfig((_config) => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    plugins: [
      replace({
        ...clientReplace,
        window: "{}",
        "isClient()": "true",
        "isServer()": "false",
        "hasHydrationData()": "false",
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.CORE_DISABLE_SSR": "true",
        "import.meta.env.SSR": "false",
        preventAssignment: true,
      }),
    ],
    build: {
      outDir: "examples/dist",
      emptyOutDir: true,
      minify: "terser",
      target: "chrome107",
      rollupOptions: {
        input: `examples/${example}.ts`,
        output: {
          dir: "examples/dist",
          format: "es",
          entryFileNames: `${example}.js`,
          inlineDynamicImports: true,
          compact: true,
        },
        context: "window",
        treeshake: "smallest",
      },
    },
    esbuild: {
      drop: ["console", "debugger"],
    },
    server: {
      port: 3000,
      open: "/examples/index.html",
    },
  };
});
