import { isClient } from "../util/environment/browser";
import type { RenderContext } from "./types";

/** @type {RenderContext} Client-side render context */
export const renderContext: RenderContext = {
  ctxID: 0,
  currentPath: isClient() ? window.location.pathname : "/",
  markers: new Map<string, [Comment, Comment]>(),
};

/**
 * Map of render context IDs to their next counter value.
 */
export const counters = new Map<number, number>();
