import type { AppState, CaptureDataFn, RestoreDataFn } from "./types";

/** Data storage strategies */
const strategies = new Map<string, [CaptureDataFn | undefined, RestoreDataFn | undefined]>();

/**
 * Creates a new application state instance.
 * @param {number} ctxId - The context ID
 * @returns {AppState} The application state instance
 */
export const createAppState = (ctxId: number): AppState => ({
  ctxID: ctxId,
  cid: 0,
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
    strategies.set(key, [captureFn, restoreFn]);
  },
  getDataStrategy(key: string): [CaptureDataFn, RestoreDataFn] | undefined {
    return strategies.get(key) as [CaptureDataFn, RestoreDataFn] | undefined;
  },
});

/** @type {AppState} Client-side application state */
export const appState: AppState = createAppState(0);
