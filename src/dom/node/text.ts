import { getCurrentComponent } from "../../component/component-stack";
import { TAG_TEXT } from "../../constants";
import { getHydrationContext } from "../../ssr/hydrate/context/hydration-context";
import { isHydrating } from "../../ssr/hydrate/storage";
import { isServer } from "../../util/environment/is-server";
import { str } from "../../util/string";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => {
  if (process.env.CORE_DISABLE_SSR) {
    return getDocument().createTextNode(str(text));
  }

  const doc = getDocument();

  if (isHydrating()) {
    const ctx = getHydrationContext();
    if (ctx) {
      if (ctx.isMismatched()) {
        const node = doc.createTextNode(str(text));
        return node;
      }

      const node = ctx.claim<Text>(TAG_TEXT);
      if (node) {
        // This is a new node created due to a mismatch in claim()
        if (node.textContent !== str(text)) {
          console.warn(`[Hydration mismatch] Text mismatch: expected "${str(text)}" but found "${node.textContent}"`);
          node.textContent = str(text);
        }
        return node;
      }
    }
  }

  const node = doc.createTextNode(str(text));

  if (isServer()) {
    getCurrentComponent()?.trackChild?.(node);
  }

  return node;
};
