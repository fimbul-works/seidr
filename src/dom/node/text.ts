import { getCurrentComponent } from "../../component/component-stack";
import { getHydrationContext } from "../../ssr/hydrate/hydration-context";
import { getHydrationMap } from "../../ssr/hydrate/storage";
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

  const hydrationContext = getHydrationContext();
  const hydrationMap = getHydrationMap();
  const doc = getDocument();

  if (hydrationContext) {
    const node = hydrationContext.claim("#text") as Text;
    if (node) {
      if (node.textContent !== str(text)) {
        console.warn(
          `[Hydration] Text mismatch: expected "${str(text)}" but found "${node.textContent}". Updating content.`,
        );
        node.textContent = str(text);
      }
      // Store the relationship for reactive updates
      hydrationMap.set(node, node);

      return node;
    } else {
      // Structural mismatch: what we found at this index is NOT a text node
      const mismatchNode = hydrationContext.lastAttemptedNode;
      const newNode: Text = doc.createTextNode(str(text));

      if (mismatchNode?.parentNode) {
        console.warn(
          `[Hydration] Tag mismatch: expected #text but found <${mismatchNode.nodeName}>. Replacing SSR node.`,
        );
        mismatchNode.parentNode.replaceChild(newNode, mismatchNode);
      }

      hydrationMap.set(newNode, newNode);
      return newNode;
    }
  }

  const node: Text = doc.createTextNode(str(text));

  if (isServer()) {
    getCurrentComponent()?.trackNode?.(node);
  }

  return node;
};
