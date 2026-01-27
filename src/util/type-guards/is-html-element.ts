/**
 * Check if a value is an HTMLElement (safely works in Node.js/SSR environments).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an HTMLElement or its server-side equivalent, `false` otherwise
 */
export const isHTMLElement = (v: any): v is HTMLElement => {
  if (typeof HTMLElement !== "undefined" && v instanceof HTMLElement) {
    return true;
  }
  // Fallback for SSR/ServerHTMLElement which may not inherit from global HTMLElement
  return v && typeof v === "object" && "tagName" in v && "dataset" in v;
};
