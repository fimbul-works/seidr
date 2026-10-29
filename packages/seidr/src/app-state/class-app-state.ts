import { isNullish } from "@fimbul-works/hvat";
import { DATA_KEY_HYDRATION_DATA } from "../constants.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/types.js";
import type { CaptureDataFn, DataStrategy, RestoreDataFn } from "./types.js";

/**
 * AppState is used for Seidr application state management.
 *
 * It provides a way to share global state between components,
 * and facilitates SSR and hydration via data strategies.
 */
export class AppState {
  /**
   * Rendering context ID is used to differentiate state between SSR requests.
   * @public
   */
  public readonly ctxID: number;

  /**
   * Markers for components.
   * @public
   */
  public readonly markers = new Map<string, [Comment, Comment]>();

  /**
   * Data storage.
   * @public
   */
  public readonly data = new Map<string, any>();

  /**
   * Data strategies for SSR and hydration.
   * @public
   */
  public readonly strategies = new Map<string, DataStrategy>();

  /**
   * Creates a new AppState instance.
   *
   * @param ctxID - The ID of the app state (default: 0).
   */
  constructor(ctxID: number = 0) {
    this.ctxID = ctxID;
  }

  /**
   * Check if data exists for a given key.
   *
   * @param key - The key to check.
   * @returns `true` if data exists, `false` otherwise.
   */
  hasData(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get data for a given key, or a default value if the key is not found.
   *
   * @template T - The type of data to get.
   * @param key - The key to get.
   * @param defaultValue - Optional default value to return if data is not found.
   * @returns The data, or undefined if not found.
   */
  getData<T>(key: string, defaultValue?: T): typeof defaultValue extends undefined ? T | undefined : T {
    if (!this.data.has(key) && !isNullish(defaultValue)) {
      this.data.set(key, defaultValue);
      return defaultValue;
    }
    return this.data.get(key);
  }

  /**
   * Set data for a given key.
   *
   * @template T - The type of data to set.
   * @param key - The key to set.
   * @param value - The value to set.
   */
  setData<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  /**
   * Delete data for a given key.
   *
   * @param key - The key to delete.
   * @returns `true` if data was deleted, `false` otherwise.
   */
  deleteData(key: string): boolean {
    return this.data.delete(key);
  }

  /**
   * Define a data strategy for hydration.
   *
   * @template T - The type of data for hydration.
   * @template I - The type of data from hydration.
   * @param key - The key to define a strategy for.
   * @param captureFn - Function to capture data for hydration.
   * @param restoreFn - Function to restore data from hydration.
   */
  defineDataStrategy<T, I>(key: string, captureFn: CaptureDataFn<T>, restoreFn: RestoreDataFn<I>): void {
    if (process.env.SEIDR_DISABLE_SSR) return;

    this.strategies.set(key, [captureFn, restoreFn]);

    if (this.hasData(DATA_KEY_HYDRATION_DATA)) {
      const hydrationData = this.getData<{ data: Record<string, any> }>(DATA_KEY_HYDRATION_DATA);
      if (hydrationData?.data && key in hydrationData.data) {
        restoreFn(hydrationData.data[key]);
      }
    }
  }

  /**
   * Get data strategy for a key.
   *
   * @template T - The type of data for hydration.
   * @param key - The key to get a strategy for.
   * @returns The data strategy, or `undefined` if not found.
   */
  getDataStrategy<T>(key: string): DataStrategy<T> | undefined {
    if (process.env.SEIDR_DISABLE_SSR) return;

    return this.strategies.get(key);
  }

  /**
   * Destroy the application state.
   * @internal
   */
  destroy(): void {
    if (process.env.SEIDR_DISABLE_SSR) return;

    this.getData<Map<string, Value>>(DATA_KEY_STATE)?.forEach((value) => value.destroy());
    this.data.forEach((value) => isValue(value) && value.destroy());
    this.data.clear();
    this.strategies.clear();
  }
}
