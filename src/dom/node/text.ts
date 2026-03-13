import { getCurrentComponent } from "../../component/component-stack";
import { TAG_TEXT } from "../../constants";
import { getHydrationContext } from "../../ssr/hydrate/context/hydration-context";
import { getHydrationMap, isHydrating } from "../../ssr/hydrate/storage";
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

  const hydrationMap = getHydrationMap();
  const doc = getDocument();

  if (isHydrating()) {
    const node = getHydrationContext()?.claim<Text>(TAG_TEXT);
    if (node) {
      if (node.textContent !== str(text)) {
        console.warn(
          `[Hydration] Text mismatch: expected "${str(text)}" but found "${node.textContent}"`,
        );
        node.textContent = str(text);
      }
      // Store the relationship for reactive updates
      hydrationMap.set(node, node);

      return node;
    } else {
      const node = doc.createTextNode(str(text));
      hydrationMap.set(node, node);
      return node;
    }
  }

  const node = doc.createTextNode(str(text));

  if (isServer()) {
    getCurrentComponent()?.trackChild?.(node);
  }

  return node;
};
