import { isClient } from "../util/environment/client";
import type { RenderContext } from "./types";

/** @type {RenderContext} Client-side render context */
export const renderContext: RenderContext = {
  ctxID: 0,
  idCounter: 0,
  currentPath: isClient() ? window.location.pathname : "/",
  markers: new Map<string, [Comment, Comment]>(),
};
