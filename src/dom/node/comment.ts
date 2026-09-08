import { getComponentScope } from "../../component/lifecycle/component-scope.js";
import { TAG_COMMENT } from "../../constants.js";
import { getHydrationContext } from "../../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../../ssr/hydrate/storage.js";
import { isServer } from "../../util/environment/is-server.js";
import { getDocument } from "../get-document.js";

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  if (process.env.SEIDR_DISABLE_SSR) {
    return getDocument().createComment(text);
  }

  const doc = getDocument();

  // If we are hydrating, we need to claim the node
  if (isHydrating()) {
    const ctx = getHydrationContext();
    if (ctx) {
      if (ctx.isMismatched()) {
        return doc.createComment(text);
      }

      const node = ctx.claim<Comment>(TAG_COMMENT);
      if (node) {
        if ((node as any).isHydrationMismatch) {
          return doc.createComment(text);
        }
        if (node.textContent !== String(text)) {
          console.warn(`[Hydration] Comment mismatch: expected "${String(text)}" but found "${node.textContent}".`);
          node.textContent = String(text);
        }
        return node;
      }
    }
  }

  const node = doc.createComment(text);

  // If we are server-side, track the node
  if (isServer()) {
    const scope = getComponentScope();
    scope?.trackChild?.(node);
  }

  return node;
};
