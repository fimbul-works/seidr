import type { SeidrComponent } from "../component/types.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/value.js";
import type { AppState, CaptureDataFn, DataStrategy, RestoreDataFn } from "./types.js";

/**
 * Creates a new application state instance.
 * @param {number} ctxId - The context ID
 * @returns {AppState} The application state instance
 */
export const createAppState = (ctxId: number): AppState => ({
  ctxID: ctxId,
  uniqID: 0,
  components: new Set<SeidrComponent>(),
  nodeIndex: new WeakMap<ChildNode, SeidrComponent>(),
  markers: new Map<string, [Comment, Comment]>(),
  data: new Map<string, any>(),
  strategies: new Map<string, DataStrategy>(),
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
  defineDataStrategy<T>(key: string, captureFn: CaptureDataFn<T>, restoreFn: RestoreDataFn<T>): void {
    this.strategies.set(key, [captureFn, restoreFn]);
  },
  getDataStrategy<T>(key: string): DataStrategy<T> | undefined {
    return this.strategies.get(key) as DataStrategy<T> | undefined;
  },
  destroy(): void {
    // Clean up components
    this.components.clear();
    this.uniqID = 0;

    // Clean up data
    this.getData<Map<string, Value>>(DATA_KEY_STATE)?.forEach((value) => value.destroy());
    this.data.forEach((value) => isValue(value) && value.destroy());
    this.data.clear();

    // Remove markers
    this.markers.forEach(([a, b]) => (a?.remove(), b?.remove()));
    this.markers.clear();

    // Clear data strategies
    this.strategies.clear();
  },
});
