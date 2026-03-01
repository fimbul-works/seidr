import { getCurrentComponent } from "../../component/component-stack";
import { isServer } from "../../util/environment/server";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  const node = getDocument().createComment(text);

  if (!process.env.CORE_DISABLE_SSR && isServer()) {
    getCurrentComponent()?.trackNode?.(node);
  }

  return node;
};
