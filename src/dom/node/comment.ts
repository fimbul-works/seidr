import { getCurrentComponent } from "../../component/component-stack";
import { TAG_COMMENT } from "../../constants";
import { getHydrationContext } from "../../ssr/hydrate/context/hydration-context";
import { getHydrationMap, isHydrating } from "../../ssr/hydrate/storage";
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

  if (isHydrating()) {
    const node = getHydrationContext()?.claim<Comment>(TAG_COMMENT);
    if (node) {
      if (node.textContent !== str(text)) {
        console.warn(`[Hydration] Comment mismatch: expected "${str(text)}" but found "${node.textContent}"`);
        node.textContent = str(text);
      }
      // Store the relationship for reactive updates
      getHydrationMap()?.set(node, node);
      return node;
    } else {
      const node = doc.createComment(text);
      getHydrationMap()?.set(node, node);
      return node;
    }
  }

  const node = doc.createComment(text);

  if (isServer()) {
    getCurrentComponent()?.trackChild?.(node);
  }

  return node;
};
