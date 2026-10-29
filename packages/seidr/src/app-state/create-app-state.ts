import { isUndef } from "@fimbul-works/hvat";
import type { SeidrComponent } from "../component/types.js";
import { DATA_KEY_HYDRATION_DATA } from "../constants.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/types.js";
import type { AppState, CaptureDataFn, DataStrategy, RestoreDataFn } from "./types.js";

/**
 * Creates a new application state instance.
 * @param {number} ctxID - The context ID
 * @returns {AppState} The application state instance
 */
export const createAppState = (ctxID: number): AppState => ({
  ctxID,
  components: new Set<SeidrComponent>(),
  nodeIndex: new WeakMap<ChildNode, SeidrComponent>(),
  markers: new Map<string, [Comment, Comment]>(),
  data: new Map<string, any>(),
  strategies: new Map<string, DataStrategy>(),
  hasData(key: string): boolean {
    return this.data.has(key);
  },
  getData<T>(key: string, defaultValue?: T): typeof defaultValue extends undefined ? T | undefined : T {
    if (!this.data.has(key) && !isUndef(defaultValue)) {
      this.data.set(key, defaultValue);
      return defaultValue;
    }
    return this.data.get(key);
  },
  setData<T>(key: string, value: T): void {
    this.data.set(key, value);
  },
  deleteData(key: string): boolean {
    return this.data.delete(key);
  },
  defineDataStrategy<T, I>(key: string, captureFn: CaptureDataFn<T>, restoreFn: RestoreDataFn<I>): void {
    if (process.env.SEIDR_DISABLE_SSR) return;
    this.strategies.set(key, [captureFn, restoreFn]);

    if (this.hasData(DATA_KEY_HYDRATION_DATA)) {
      const hydrationData = this.getData<{ data?: Record<string, any> }>(DATA_KEY_HYDRATION_DATA);
      if (hydrationData?.data && key in hydrationData.data) {
        restoreFn(hydrationData.data[key]);
      }
    }
  },
  getDataStrategy<T>(key: string): DataStrategy<T> | undefined {
    if (process.env.SEIDR_DISABLE_SSR) return;
    return this.strategies.get(key);
  },
  destroy(): void {
    if (process.env.SEIDR_DISABLE_SSR) return;

    // Clean up components
    this.components.clear();

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
