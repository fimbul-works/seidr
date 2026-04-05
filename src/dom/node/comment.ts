import { useScope } from "../../component/use-scope";
import { TAG_COMMENT } from "../../constants";
import { getHydrationContext } from "../../ssr/hydrate/context/hydration-context";
import { isHydrating } from "../../ssr/hydrate/storage";
import { isServer } from "../../util/environment/is-server";
import { str } from "../../util/string";
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

  if (!isServer() && isHydrating()) {
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
          console.warn(
            `[Hydration mismatch] Comment mismatch: expected "${str(text)}" but found "${node.textContent}"`,
          );
          node.textContent = str(text);
        }
        return node;
      }
    }
  }

  const node = doc.createComment(text);

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
