import { getCurrentComponent } from "../../component/component-stack";
import { getHydrationContext } from "../../ssr/hydrate/hydration-context";
import { hydrationMap } from "../../ssr/hydrate/node-map";
import { isServer } from "../../util/environment/server";
import { str } from "../../util/string";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => {
  const hydrationContext = !process.env.CORE_DISABLE_SSR ? getHydrationContext() : null;
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
      const newNode: Text = getDocument().createTextNode(str(text));

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

  const node: Text = getDocument().createTextNode(str(text));

  if (!process.env.CORE_DISABLE_SSR && isServer()) {
    getCurrentComponent()?.trackNode?.(node);
  }

  return node;
};
