import type { Plugin } from "rolldown";

/**
 * Rewrites relative non-SSR imports in the SSR bundle to pull from the main bundle,
 * avoiding duplicated code between the two bundles.
 *
 * @param {string} mainBundle - The path to the main bundle (default: "./seidr.js")
 * @returns {Plugin} The plugin instance
 */
export function redirectNonSsrImports(mainBundle = "./seidr.js"): Plugin {
  return {
    name: "redirect-non-ssr-imports",
    renderChunk(code: string) {
      const importRe = /^import\s+\{([^}]+)\}\s+from\s+"([^"]+)";$/gm;
      const collected: string[] = [];

      // First collect all imports
      const result = code.replace(importRe, (match, specifiers, path) => {
        if (path.startsWith("node:")) return match;

        specifiers
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .forEach((s: string) => collected.push(s));

        return "";
      });

      // Remove unused imports
      for (const specifier of collected) {
        if (!result.includes(specifier)) {
          collected.splice(collected.indexOf(specifier), 1);
        }
      }

      // If no imports are left, return the result
      if (!collected.length) return result;

      // Merge imports
      const merged = `import { ${collected.toSorted().join(", ")} } from "${mainBundle}";`;
      return `${merged}\n${result.trimStart()}`;
    },
  };
}
