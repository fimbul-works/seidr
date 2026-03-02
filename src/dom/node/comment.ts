import { getCurrentComponent } from "../../component/component-stack";
import { getHydrationContext } from "../../ssr/hydrate/hydration-context";
import { isServer } from "../../util/environment/server";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  const hydrationContext = !process.env.CORE_DISABLE_SSR ? getHydrationContext() : null;
  if (hydrationContext) {
    const node = hydrationContext.claim("#comment") as Comment;
    if (node) {
      if (node.textContent !== text) {
        node.textContent = text;
      }
      return node;
    }
  }

  const node = getDocument().createComment(text);

  if (!process.env.CORE_DISABLE_SSR && isServer()) {
    getCurrentComponent()?.trackNode?.(node);
  }

  return node;
};
