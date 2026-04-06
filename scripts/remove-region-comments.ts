import type { Plugin } from "rolldown";

/**
 * Removes region comments from the code.
 * @returns {Plugin}
 */
export function removeRegionComments(): Plugin {
  return {
    name: "remove-region-comments",
    renderChunk(code: string) {
      return code.replaceAll(/^\/\/#(region|endregion).*$/gm, "").replace(/\n{3,}/g, "\n\n");
    },
  };
}
