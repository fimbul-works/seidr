import { join } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    build: {
      outDir: "examples/dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      target: "es2020",
      rollupOptions: {
        input: `examples/${example}.ts`,
        output: {
          dir: "examples/dist",
          format: "iife",
          entryFileNames: `${example}.js`,
          inlineDynamicImports: true,
          compact: true,
        },
        treeshake: "smallest",
      },
    },
    server: {
      port: 3000,
      open: "/examples/index.html",
    },
  };
});
