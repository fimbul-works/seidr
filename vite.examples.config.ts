import { defineConfig } from "vite";
import { browserReplace } from "./rollup.shared";

export default defineConfig((_config) => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    build: {
      outDir: "examples/dist",
      emptyOutDir: true,
      minify: "terser",
      target: "es2020",
      rollupOptions: {
        input: `examples/${example}.ts`,
        output: {
          dir: "examples/dist",
          format: "es",
          entryFileNames: `${example}.js`,
          inlineDynamicImports: true,
          compact: true,
        },
        treeshake: "smallest",
      },
    },
    esbuild: {
      define: { ...browserReplace, "process.env.NO_SSR": "'true'" },
    },
    server: {
      port: 3000,
      open: "/examples/index.html",
    },
  };
});
