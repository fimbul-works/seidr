export function removeRegionComments() {
  return {
    name: "remove-region-comments",
    renderChunk(code: string) {
      return code.replace(/^\/\/#(region|endregion).*$/gm, "").replace(/\n{3,}/g, "\n\n");
    },
  };
}
