import { useScope } from "../../component/use-scope.js";
import { TAG_TEXT } from "../../constants.js";
import { getHydrationContext } from "../../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../../ssr/hydrate/storage.js";
import { isServer } from "../../util/environment/is-server.js";
import { getDocument } from "../get-document.js";

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => {
  if (process.env.SEIDR_DISABLE_SSR) {
    return getDocument().createTextNode(String(text));
  }

  const doc = getDocument();

  // If we are hydrating, we need to claim the node
  if (isHydrating()) {
    const ctx = getHydrationContext();
    if (ctx) {
      if (ctx.isMismatched()) {
        return doc.createTextNode(String(text));
      }

      const node = ctx.claim<Text>(TAG_TEXT);
      if (node) {
        // This is a new node created due to a mismatch in claim()
        if (node.textContent !== String(text)) {
          console.warn(`[Hydration] Text mismatch: expected "${String(text)}" but found "${node.textContent}."`);
          node.textContent = String(text);
        }
        return node;
      }
    }
  }

  const node = doc.createTextNode(String(text));

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
