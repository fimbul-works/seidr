import { defineConfig } from "vite";

export default defineConfig((_config) => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    define: {
      // Production build
      "process.env.NODE_ENV": '"production"',
      // Disable SSR code
      process: "undefined",
      window: "true",
      // Always false in browser builds
      "process.env.SEIDR_TEST_SSR": "false",
      // Strip away SSR
      "process.env.CLIENT_BUNDLE": "true",
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
          format: "es",
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
