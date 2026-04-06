import replace from "@rollup/plugin-replace";
import { defineConfig, type UserConfig } from "vite";
import { clientNoSSRReplace, treeshake } from "./build.shared.ts";

export default defineConfig(() => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    plugins: [
      replace({
        ...clientNoSSRReplace,
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.USE_SCHEDULER": "true",
        window: "{}",
        __SEIDR_DEV__: "false",
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
          codeSplitting: false,
        },
        context: "window",
        treeshake,
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
