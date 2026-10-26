import { execSync } from "node:child_process";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const scripts = ["build:webpack", "build:vite", "build:rollup", "build:rolldown", "build:esbuild", "build:babel"];

console.log("==================================================================");
console.log("  Building Seidr isomorphic app across ALL supported build tools  ");
console.log("  (Webpack, Vite, Rollup, Rolldown, Esbuild, Babel)               ");
console.log("==================================================================\n");

for (const script of scripts) {
  console.log(`\n>>> Running ${script}...`);
  execSync(`pnpm ${script}`, {
    cwd: rootDir,
    stdio: "inherit",
  });
}

console.log("\n==================================================================");
console.log("✓ All 6 build systems built successfully!");
console.log("==================================================================");
