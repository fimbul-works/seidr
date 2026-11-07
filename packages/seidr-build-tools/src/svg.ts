import fs from "node:fs";

/**
 * Checks if an import ID corresponds to an SVG component import.
 * Excludes queries like `?url` or `?raw`.
 *
 * @param {string} id - The module import ID
 * @returns {boolean} True if the file should be loaded as an SVG component
 */
export function isSvgComponent(id: string): boolean {
  if (id.startsWith("\0")) return false;
  const [filePath, query] = id.split("?");
  if (!filePath.endsWith(".svg")) {
    return false;
  }
  if (query) {
    const params = new URLSearchParams(query);
    if (params.has("url") || params.has("raw")) {
      return false;
    }
  }
  return true;
}

/**
 * Compiles raw SVG markup into a Seidr SVG component module string.
 *
 * @param {string} svgContent - The raw SVG string
 * @returns {string} Compiled JavaScript module code
 */
export function compileSvgToSeidr(svgContent: string): string {
  return `import { createSvgIcon } from "@fimbul-works/seidr";\nexport default createSvgIcon(${JSON.stringify(svgContent)});\n`;
}

/**
 * Loads an SVG file from disk and returns the compiled Seidr component module.
 *
 * @param {string} id - The module import ID
 * @returns {string | null} Compiled code, or null if not applicable
 */
export function loadSvgFile(id: string): string | null {
  if (!isSvgComponent(id)) return null;
  const filePath = id.split("?")[0];
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    return compileSvgToSeidr(code);
  } catch {
    return null;
  }
}

