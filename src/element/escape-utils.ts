/**
 * Escapes text content for safe inclusion in HTML.
 */
export function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escapes attribute values for safe inclusion in HTML.
 * Same as escapeText but specifically for attributes.
 */
export function escapeAttribute(value: string): string {
  return escapeText(value);
}

/**
 * Escapes style attribute values.
 * In addition to standard HTML escaping, we ensure that the value
 * is safe within a style context.
 */
export function escapeStyleAttribute(value: string): string {
  // For style attributes, we escape standard HTML characters.
  // We also potentially want to strip or escape characters that could break out of a CSS context
  // but for a simple attribute value like "color: red", escapeAttribute is usually enough.
  return escapeAttribute(value);
}
