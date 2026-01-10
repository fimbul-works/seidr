import { defineConfig } from "vite";

export default defineConfig((_config) => {
  const example = process.env.EXAMPLE || "counter";

  return {
    root: "examples",
    define: {
      preventAssignment: true,
      // Production build
      "process.env.NODE_ENV": '"production"',
      // Always false in browser builds
      "process.env.SEIDR_TEST_SSR": "false",
      // Strip away SSR
      "process.env.CLIENT_BUNDLE": "true",
      "process.env.CORE_BUNDLE": "true",
      // Disable SSR code
      process: "undefined",
      window: "{}",
    },
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
    server: {
      port: 3000,
      open: "/examples/index.html",
    },
  };
});
