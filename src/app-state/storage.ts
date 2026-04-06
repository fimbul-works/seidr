import { isSeidr } from "../util/type-guards/obserbable-types";
import type { AppState, CaptureDataFn, RestoreDataFn } from "./types";

/**
 * Creates a new application state instance.
 * @param {number} ctxId - The context ID
 * @returns {AppState} The application state instance
 */
export const createAppState = (ctxId: number): AppState => ({
  ctxId,
  seidrIdCounter: 0,
  markers: new Map<string, [Comment, Comment]>(),
  data: new Map<string, any>(),
  strategies: new Map<string, [CaptureDataFn, RestoreDataFn]>(),
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
    this.strategies.set(key, [captureFn, restoreFn]);
  },
  getDataStrategy(key: string): [CaptureDataFn, RestoreDataFn] | undefined {
    return this.strategies.get(key) as [CaptureDataFn, RestoreDataFn] | undefined;
  },
  destroy(): void {
    for (const value of this.data.values()) {
      if (isSeidr(value)) {
        value.destroy();
      }
    }
    this.data.clear();
    this.markers.clear();
    this.strategies.clear();
  },
});
