import { getRenderContext } from "./render-context.js";

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
  constructor(private value: T) {}

  /**
   * Get the stored value.
   * @returns Stored application state
   */
  get(): T {
    return this.value;
  }
}

// Extract generic from instance
export type InferStateType<C> = C extends State<infer T> ? T : never;

/**
 * Create a new State key with associated type.
 *
 * This function is used to access the type-safe application state.
 *
 * @template T - State type
 *
 * @param key - Key for the State object
 * @returns Symbol that contains the key for the State
 */
export const createStateKey = <T>(key?: string): StateKey<T> => {
  return Symbol(key) as StateKey<T>;
};

/** Storage: Map<renderScopeID, Map<symbol, any>> */
const renderContextStates = new Map<number, Map<symbol, unknown>>();

/**
 * Check if application State exists for the given key.
 *
 * @template T - State type
 *
 * @param key - Key for the State object
 * @returns true if a State with this key exists, false otherwise
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
 * @param key - Key for the State object
 * @param value - State object
 * @returns true if a State with this key exists, false otherwise
 */
export function setState<T>(key: StateKey<T>, value: T): void {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;

  if (!renderContextStates.has(renderScopeID)) {
    renderContextStates.set(renderScopeID, new Map());
  }

  renderContextStates.get(renderScopeID)!.set(key, value);
}

/**
 * Get application State object with key.
 *
 * @template T - State type
 *
 * @param key - Key for the State object
 * @returns true if a State with this key exists, false otherwise
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

/**
 * Clear all States for a render context.
 * This fucntion should be called at the end of a SSR request.
 * @param renderContextID - Render context ID
 * @returns true if the renderScopeState existed, false otherwise
 */
export const clearRenderContextState = (renderContextID: number) => renderContextStates.delete(renderContextID);
