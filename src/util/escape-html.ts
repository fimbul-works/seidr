import { isStr } from "./type-guards";

/**
 * Escapes special characters for use in HTML text and attributes.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeHTML(str: string): string {
  if (!isStr(str)) str = String(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
