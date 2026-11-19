import { readdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { seidrVitePlugin } from "@fimbul-works/seidr-build-tools/vite";
import { build } from "vite";

const isDev = process.env.NODE_ENV !== "production";

const rootDir = import.meta.dirname;
const outDir = resolve(rootDir, "dist");

console.log("Cleaning output directory:", outDir);
await rm(outDir, { recursive: true, force: true });

// Discover all subdirectories containing an index.html
const entries = await readdir(rootDir, { withFileTypes: true });
const exampleDirs: string[] = [];

for (const entry of entries) {
  if (entry.isDirectory() && !["dist", "build", "node_modules", "public"].includes(entry.name)) {
    try {
      const htmlPath = resolve(rootDir, entry.name, "index.html");
      const htmlStat = await stat(htmlPath);
      if (htmlStat.isFile()) {
        exampleDirs.push(entry.name);
      }
    } catch {
      // Not an example directory
    }
  }
}

console.log(`Discovered ${exampleDirs.length} example apps:`, exampleDirs.join(", "));

// Plugin to preserve <script type="module" src="/particles.js"></script> in HTML
// without Vite bundling particles.ts into the individual SPA entry chunks
const isolateParticlesPlugin = {
  name: "isolate-particles",
  transformIndexHtml: {
    order: "pre" as const,
    handler(html: string) {
      return html.replace(
        /<script[^>]*src=["']\/particles\.js["'][^>]*><\/script>/g,
        "<!-- PARTICLES_SCRIPT_PLACEHOLDER -->",
      );
    },
  },
};

const restoreParticlesPlugin = {
  name: "restore-particles",
  transformIndexHtml: {
    order: "post" as const,
    handler(html: string) {
      return html.replace(
        "<!-- PARTICLES_SCRIPT_PLACEHOLDER -->",
        '<script type="module" src="/particles.js"></script>',
      );
    },
  },
};

// Build each example app individually as an isolated standalone SPA
for (const app of exampleDirs) {
  console.log(`\nBuilding standalone SPA: ${app}...`);
  await build({
    configFile: false,
    root: rootDir,
    publicDir: resolve(rootDir, "../../public"),
    plugins: [seidrVitePlugin({ disableSSR: true }), isolateParticlesPlugin, restoreParticlesPlugin],
    build: {
      outDir,
      emptyOutDir: false,
      sourcemap: isDev ? "inline" : false,
      modulePreload: { polyfill: false },
      minify: isDev ? false : "esbuild",
      target: "esnext",
      rollupOptions: {
        input: resolve(rootDir, app, "index.html"),
        output: {
          format: "es",
          entryFileNames: `assets/${app}-[hash].js`,
          chunkFileNames: `assets/${app}-[name]-[hash].js`,
          assetFileNames: `assets/${app}-[name]-[hash][extname]`,
          codeSplitting: false,
          comments: false,
        },
        treeshake: true,
        external: ["node:fs", "node:path", "node:async_hooks"],
      },
    },
    esbuild: {
      drop: isDev ? [] : ["console", "debugger"],
    },
  });
}

// Build the root landing index.html page and copy public assets
console.log("\nBuilding root index page...");
await build({
  configFile: false,
  root: rootDir,
  publicDir: resolve(rootDir, "../../public"),
  plugins: [seidrVitePlugin({ disableSSR: true }), isolateParticlesPlugin, restoreParticlesPlugin],
  build: {
    outDir,
    emptyOutDir: false,
    minify: false,
    sourcemap: false,
    target: "chrome107",
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: resolve(rootDir, "index.html"),
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
      treeshake: true,
      external: ["node:fs", "node:path", "node:async_hooks"],
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
});

console.log("\nAll example SPAs built successfully into:", outDir);
