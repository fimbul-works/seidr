import { useScope } from "../../component/use-scope.js";
import { TAG_COMMENT } from "../../constants.js";
import { getHydrationContext } from "../../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../../ssr/hydrate/storage.js";
import { isServer } from "../../util/environment/is-server.js";
import { str } from "../../util/string.js";
import { getDocument } from "../get-document.js";

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  if (!process.env.SEIDR_ENABLE_SSR) {
    return getDocument().createComment(text);
  }

  const doc = getDocument();

  // If we are hydrating, we need to claim the node
  if (isHydrating()) {
    const ctx = getHydrationContext();
    if (ctx) {
      if (ctx.isMismatched()) {
        const node = doc.createComment(text);
        return node;
      }

      const node = ctx.claim<Comment>(TAG_COMMENT);
      if (node) {
        // This is a new node created due to a mismatch in claim()
        if (node.textContent !== str(text)) {
          console.warn(`[Hydration] Comment mismatch: expected "${str(text)}" but found "${node.textContent}".`);
          node.textContent = str(text);
        }
        return node;
      }
    }
  }

  const node = doc.createComment(text);

  // If we are server-side, we need to track the node
  if (isServer()) {
    if (process.env.VITEST) {
      try {
        useScope().trackChild(node);
      } catch (_) {
        // Ignore
      }
    } else {
      useScope().trackChild(node);
    }
  }

  return node;
};
