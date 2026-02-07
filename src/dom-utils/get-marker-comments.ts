import { getDOMFactory } from "../dom-factory";
import { getRenderContext } from "../render-context";
import { findMarkerComments } from "./find-marker-comments";

/**
 * Get or create boundary markers for a given ID.
 * Uses RenderContext cache for stability.
 */
export function getMarkerComments(id: string): [Comment, Comment] {
  const ctx = getRenderContext();
  if (!ctx.markerCache) ctx.markerCache = new Map();

  // Check cache first
  const cached = ctx.markerCache.get(id);
  if (cached) return cached;

  const domFactory = getDOMFactory();

  // Try to find in DOM (for hydration/SSR)
  let [start, end] = findMarkerComments(id);

  // Otherwise create new
  if (!start) start = domFactory.createComment(`s:${id}`);
  if (!end) end = domFactory.createComment(`e:${id}`);

  const markers: [Comment, Comment] = [start, end];
  ctx.markerCache.set(id, markers);

  return markers;
}
