import { defineConfig } from "vite";

export default defineConfig((_config) => {
  return {
    root: "examples/ssr",
    define: {
      process: "undefined",
    },
    build: {
      outDir: "examples/ssr/dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      target: "es2020",
      rollupOptions: {
        input: `examples/ssr/entry-client.ts`,
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
    server: {
      port: 3000,
      open: "/examples/ssr/index.html",
    },
  };
});
