import { getDOMFactory } from "./dom-factory";

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => getDOMFactory().createTextNode(String(text));
