import type { CleanupFunction } from "../types.js";
import { isSeidr } from "../util/type-guards/obserbable-types.js";
import type { AppState, CaptureDataFn, RestoreDataFn } from "./types.js";

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
  strategies: new Map<string, [CaptureDataFn<any>, RestoreDataFn<any>, CleanupFunction | undefined]>(),
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
  defineDataStrategy<T>(
    key: string,
    captureFn: CaptureDataFn<T>,
    restoreFn: RestoreDataFn<T>,
    cleanupFn?: CleanupFunction,
  ): void {
    this.strategies.set(key, [captureFn, restoreFn, cleanupFn]);
  },
  getDataStrategy<T>(key: string): [CaptureDataFn<T>, RestoreDataFn<T>, CleanupFunction | undefined] | undefined {
    return this.strategies.get(key) as [CaptureDataFn<T>, RestoreDataFn<T>, CleanupFunction | undefined] | undefined;
  },
  destroy(): void {
    // Clean up data
    this.data.forEach((value) => isSeidr(value) && value.destroy());
    this.data.clear();

    // Call cleanup functions for strategies
    this.strategies.forEach(([, , cleanup]) => cleanup?.());
    this.strategies.clear();

    // Remove markers
    this.markers.forEach(([a, b]) => (a.remove(), b.remove()));
    this.markers.clear();
  },
});
