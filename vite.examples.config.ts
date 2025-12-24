import { join } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.SEIDR_TEST_SSR": "false", // Always false in browser builds
      window: "true", // Disable SSR code
    },
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
