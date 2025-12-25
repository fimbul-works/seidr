import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";

const library = process.env.LIBRARY || "full";
const entry = `dist/esm/${library === "core" ? "index.core.js" : "index.js"}`;

export default {
  input: entry,
  output: {
    file: `dist/seidr.${library}.js`,
    format: "es",
    sourcemap: true,
    compact: true,
  },
  plugins: [
    replace({
      // Production build
      "process.env.NODE_ENV": '"production"',
      // Disable SSR code
      process: "undefined",
      window: "true",
      // Always false in browser builds
      "process.env.SEIDR_TEST_SSR": "false",
      // Strip away SSR
      "process.env.CLIENT_BUNDLE": "true",
    }),
    terser({
      module: true,
      mangle: {
        properties: false,
        // Preserve class names for instanceof checks
        reserved: ["Seidr"],
      },
      compress: {
        passes: 2,
      },
    }),
  ],
  external: [],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
};
