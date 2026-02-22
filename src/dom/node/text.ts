import { getRenderContext } from "../../render-context";
import { getFeature } from "../../render-context/feature";
import { getHydrationCursorFeature } from "../../ssr/hydrate/feature";
import { hasHydrationData } from "../../ssr/hydrate/has-hydration-data";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => {
  if (process.env.CORE_DISABLE_SSR || !hasHydrationData()) {
    return getDocument().createTextNode(String(text));
  }

  const cursor = getFeature(getHydrationCursorFeature(), getRenderContext());
  const claimed = cursor?.claimText(String(text));
  if (claimed) {
    return claimed;
  }
  return getDocument().createTextNode(String(text));
};
