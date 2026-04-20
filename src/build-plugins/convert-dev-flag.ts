import type { Plugin } from "rolldown";

/**
 * Replaces `__SEIDR_DEV__` with `(typeof process !== "undefined" && process.env.NODE_ENV === "development")`.
 * This allows building bundles that can include dev-mode oriented code.
 *
 * @returns {Plugin}
 */
export function convertDevFlag(): Plugin {
  return {
    name: "convert-dev-flag",
    renderChunk(code: string) {
      return code.replaceAll(
        /\b__SEIDR_DEV__\b/g,
        '(typeof process !== "undefined" && process.env.NODE_ENV === "development")',
      );
    },
  };
}
