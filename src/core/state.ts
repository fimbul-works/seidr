import { getRenderContext } from "./render-context-contract";

/**
 * Type-safe state key that carries its type
 *
 * @template T - State type
 */
export type StateKey<T> = symbol & { readonly __type?: T };

// Extract generic from instance
export type InferStateType<C> = C extends StateKey<infer T> ? T : never;

/** Storage: Map<renderScopeID, Map<symbol, any>> */
export const globalStates = new Map<number, Map<symbol, unknown>>();

/** Symbol name registry: Map<symbol, string> for serialization */
export const symbolNames = new Map<string, symbol>();

/**
 * Create a new state key with associated type.
 *
 * This function is used to access the type-safe application state.
 *
 * @template T - State type
 *
 * @param {string} key - Key for the state
 * @returns {StateKey<T>} Symbol that contains the key for the state
 */
export function createStateKey<T>(key: string): StateKey<T> {
  const symbol = Symbol(key) as StateKey<T>;
  symbolNames.set(key, symbol);
  return symbol;
}

/**
 * Check if application state exists for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T>} key - Key for the state
 * @returns {boolean} true if a state with this key exists, false otherwise
 */
export function hasState<T>(key: StateKey<T>): boolean {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  return globalStates.get(renderScopeID)?.has(key) ?? false;
}

/**
 * Set application state for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T>} key - Key for the state
 * @param {T} value - State value
 */
export function setState<T>(key: StateKey<T>, value: T): void {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  // Create render context state
  if (!globalStates.has(renderScopeID)) {
    globalStates.set(renderScopeID, new Map());
  }
  globalStates.get(renderScopeID)!.set(key, value);
}

/**
 * Get application state with key.
 *
 * @template T - state type
 *
 * @param {StateKey<T>} key - Key for the state
 * @returns {T} State value
 * @throws {Error} if state is not set
 */
export function getState<T>(key: StateKey<T>): T {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;

  const ctxStates = globalStates.get(renderScopeID);
  if (!ctxStates?.has(key)) {
    throw new Error(`State not found for key: ${String(key)}`);
  }

  return ctxStates.get(key) as T;
}
