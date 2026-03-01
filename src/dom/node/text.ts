import { getCurrentComponent } from "../../component/component-stack";
import { isServer } from "../../util/environment/server";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => {
  const node: Text = getDocument().createTextNode(String(text));

  if (!process.env.CORE_DISABLE_SSR && isServer()) {
    getCurrentComponent()?.trackNode?.(node);
  }

  return node;
};
