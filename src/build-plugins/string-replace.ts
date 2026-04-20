import type { Plugin } from "rolldown";

/**
 * Creates a plugin that replaces specified strings in the code during the build process.
 *
 * @param {Record<string, string>} replacements - An object where keys are strings to be replaced and values are their replacements.
 * @returns {Plugin}
 */
export function stringReplace(replacements: Record<string, string>): Plugin {
  return {
    name: "string-replace",
    renderChunk(code: string) {
      for (const [from, to] of Object.entries(replacements)) {
        code = code.replaceAll(from, to);
      }
      return code;
    },
  };
}
