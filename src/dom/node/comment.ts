import { getRenderContext } from "../../render-context";
import { getFeature } from "../../render-context/feature";
import { getHydrationCursorFeature } from "../../ssr/hydrate/feature";
import { hasHydrationData } from "../../ssr/hydrate/has-hydration-data";
import { getDocument } from "../get-document";

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  if (process.env.CORE_DISABLE_SSR || !hasHydrationData()) {
    return getDocument().createComment(text);
  }

  const cursor = getFeature(getHydrationCursorFeature(), getRenderContext());
  const claimed = cursor?.claimComment(text);
  if (claimed) {
    return claimed;
  }
  return getDocument().createComment(text);
};
