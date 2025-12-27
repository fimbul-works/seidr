import { getRenderContext } from "./render-context-contract";

/**
 * Type-safe state key that carries its type
 *
 * @template T - State type
 */
export type StateKey<T> = symbol & { readonly __type?: T };

/**
 * Type-safe State object to store global application state.
 * @template T - State type
 */
export class State<T> {
  /**
   * @param key - Value to store in this State
   */
  constructor(private v: T) {}

  /**
   * Get the stored value.
   * @returns Stored application state
   */
  get value(): T {
    return this.v;
  }
}

// Extract generic from instance
export type InferStateType<C> = C extends State<infer T> ? T : never;

/** Storage: Map<renderScopeID, Map<symbol, any>> */
export const renderContextStates = new Map<number, Map<symbol, unknown>>();

/** Symbol name registry: Map<symbol, string> for serialization */
export const symbolNames = new Map<string, symbol>();

/**
 * Create a new State key with associated type.
 *
 * This function is used to access the type-safe application state.
 *
 * @template T - State type
 *
 * @param {string} key - Key for the State object
 * @returns {StateKey<T>} Symbol that contains the key for the State
 */
export function createStateKey<T>(key: string): StateKey<T> {
  const symbol = Symbol(key) as StateKey<T>;
  symbolNames.set(key, symbol);
  return symbol;
}

/**
 * Check if application State exists for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T>} key - Key for the State object
 * @returns {boolean} true if a State with this key exists, false otherwise
 */
export function hasState<T>(key: StateKey<T>): boolean {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  return renderContextStates.get(renderScopeID)?.has(key) ?? false;
}

/**
 * Set application State for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T>} key - Key for the State object
 * @param {T} value - State object
 * @returns {boolean} true if a State with this key exists, false otherwise
 */
export function setState<T>(key: StateKey<T>, value: T): void {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  // Create render context state
  if (!renderContextStates.has(renderScopeID)) {
    renderContextStates.set(renderScopeID, new Map());
  }
  renderContextStates.get(renderScopeID)!.set(key, value);
}

/**
 * Get application State with key.
 *
 * @template T - State type
 *
 * @param {StateKey<T>} key - Key for the State
 * @returns {T} State
 */
export function getState<T>(key: StateKey<T>): T {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;

  const ctxStates = renderContextStates.get(renderScopeID);
  if (!ctxStates?.has(key)) {
    throw new Error(`State not found for key: ${String(key)}`);
  }

  return ctxStates.get(key) as T;
}
