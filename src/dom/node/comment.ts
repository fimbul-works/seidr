import { getCurrentComponent } from "../../component/component-stack";
import { TAG_COMMENT } from "../../constants";
import { getHydrationContext } from "../../ssr/hydrate/hydration-context";
import { isServer } from "../../util/environment/is-server";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  if (process.env.CORE_DISABLE_SSR) {
    return getDocument().createComment(text);
  }

  const doc = getDocument();
  const hydrationContext = getHydrationContext();

  if (hydrationContext) {
    const node = hydrationContext.claim(TAG_COMMENT) as Comment;
    if (node) {
      if (node.textContent !== text) {
        console.warn(
          `[Hydration] Comment mismatch: expected "${text}" but found "${node.textContent}". Updating content.`,
        );
        node.textContent = text;
      }
      return node;
    } else {
      // Structural mismatch
      const mismatchNode = hydrationContext.lastAttemptedNode;
      const newNode = doc.createComment(text);
      if (mismatchNode?.parentNode) {
        console.warn(
          `[Hydration] Tag mismatch: expected ${TAG_COMMENT} but found ${mismatchNode.nodeName}. Replacing SSR node.`,
        );
        mismatchNode.parentNode.replaceChild(newNode, mismatchNode);
      }
      return newNode;
    }
  }

  const node = doc.createComment(text);

  if (isServer()) {
    getCurrentComponent()?.trackNode?.(node);
  }

  return node;
};
