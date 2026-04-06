import type { Plugin } from "rolldown";

/**
 * Replaces __SEIDR_DEV__ with process.env.NODE_ENV !== "production"
 * @returns {Plugin}
 */
export function convertDevFlag(): Plugin {
  return {
    name: "convert-dev-flag",
    renderChunk(code: string) {
      return code.replace(/__SEIDR_DEV__/g, '(process.env.NODE_ENV === "development")');
    },
  };
}
