import type { AppState, CaptureDataFn, RestoreDataFn } from "./types";

/** Key that is shared across build targets */
const DATA_STRATEGIES_KEY = "__SEIDR_APP_STATE_STRATEGIES__";

/** AppState provider is shared across built bundles */
if (!globalThis[DATA_STRATEGIES_KEY]) {
  globalThis[DATA_STRATEGIES_KEY] = new Map<string, [CaptureDataFn, RestoreDataFn]>();
}

/**
 * Creates a new application state instance.
 * @param {number} ctxId - The context ID
 * @returns {AppState} The application state instance
 */
export const createAppState = (ctxId: number): AppState => ({
  ctxID: ctxId,
  seidrIdCounter: 0,
  markers: new Map<string, [Comment, Comment]>(),
  data: new Map<string, any>(),
  hasData(key: string): boolean {
    return this.data.has(key);
  },
  getData<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  },
  setData<T>(key: string, value: T): void {
    this.data.set(key, value);
  },
  deleteData(key: string): boolean {
    return this.data.delete(key);
  },
  defineDataStrategy(key: string, captureFn: CaptureDataFn, restoreFn: RestoreDataFn): void {
    globalThis[DATA_STRATEGIES_KEY]?.set(key, [captureFn, restoreFn]);
  },
  getDataStrategy(key: string): [CaptureDataFn, RestoreDataFn] | undefined {
    return globalThis[DATA_STRATEGIES_KEY]?.get(key) as [CaptureDataFn, RestoreDataFn] | undefined;
  },
});
