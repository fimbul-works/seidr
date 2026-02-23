import type { RenderContext } from "./types";

/** @type {RenderContext} Client-side render context */
export const renderContext: RenderContext = {
  ctxID: 0,
  sID: 0,
  cID: 0,
  markers: new Map<string, [Comment, Comment]>(),
  featureData: new Map<string, any>(),
};
