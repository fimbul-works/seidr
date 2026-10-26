import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { seidrWebpackPlugin } from "@fimbul-works/seidr-build-tools/webpack";
import webpack from "webpack";

function runWebpack(config: webpack.Configuration): Promise<webpack.Stats | undefined> {
  return new Promise((resolvePromise, rejectPromise) => {
    webpack(config, (err, stats) => {
      if (err) return rejectPromise(err);
      resolvePromise(stats);
    });
  });
}

const rootDir = resolve(import.meta.dirname, "..");
const outDir = resolve(rootDir, "dist/webpack");

console.log("==> Building with Webpack...");
await rm(outDir, { recursive: true, force: true });

// Common Webpack configuration elements
const commonRules = [
  {
    test: /\.(m?js|ts)$/,
    resolve: {
      fullySpecified: false,
    },
  },
  {
    test: /\.ts$/,
    use: [
      {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-typescript"],
        },
      },
    ],
  },
];

const commonResolve = {
  extensions: [".ts", ".js", ".mjs"],
  extensionAlias: {
    ".js": [".ts", ".js"],
  },
};

// 1. Build client bundle with Webpack
console.log("--> Webpack: Building client bundle...");
const clientResult = await runWebpack({
  mode: "production",
  target: "web",
  entry: resolve(rootDir, "src/entry-client.ts"),
  output: {
    path: outDir,
    filename: "client.js",
    library: { type: "module" },
  },
  experiments: { outputModule: true },
  resolve: commonResolve,
  module: {
    rules: commonRules,
  },
  plugins: [seidrWebpackPlugin({ target: "browser" })],
  optimization: {
    minimize: false,
    usedExports: true,
  },
});

if (clientResult?.hasErrors()) {
  const errors = clientResult.toJson({ errorDetails: true }).errors;
  for (const err of errors || []) {
    console.error("Webpack client build error:", err.message);
  }
  process.exit(1);
}

// 2. Build server bundle with Webpack
console.log("--> Webpack: Building server bundle...");
const serverResult = await runWebpack({
  mode: "production",
  target: "node",
  entry: resolve(rootDir, "src/entry-server.ts"),
  output: {
    path: outDir,
    filename: "server.js",
    library: { type: "module" },
  },
  experiments: { outputModule: true },
  resolve: commonResolve,
  module: {
    rules: commonRules,
  },
  plugins: [seidrWebpackPlugin({ target: "ssr" })],
  optimization: {
    minimize: false,
    usedExports: true,
  },
});

if (serverResult?.hasErrors()) {
  const errors = serverResult.toJson({ errorDetails: true }).errors;
  for (const err of errors || []) {
    console.error("Webpack server build error:", err.message);
  }
  process.exit(1);
}

console.log("✓ Webpack client and server builds completed successfully into:", outDir);
