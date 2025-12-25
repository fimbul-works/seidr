import { AsyncLocalStorage } from "node:async_hooks";
import type { RenderContext } from "./core/types.js";

const SEIDR_STORAGE_KEY = Symbol.for("Seidr.AsyncLocalStorage");

/** @type {symbol} Get or create the singleton instance on the global object */
export const asyncLocalStorage = (() => {
  const g = global as any;
  if (!g[SEIDR_STORAGE_KEY]) {
    g[SEIDR_STORAGE_KEY] = new AsyncLocalStorage<RenderContext>();
  }
  return g[SEIDR_STORAGE_KEY];
})();
