import { getRenderContext } from "./dom/render-context.js";
import { Seidr } from "./seidr.js";
import { isSeidr } from "./util/is.js";

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

/** Storage: Map<renderScopeID, Map<symbol, any>> */
const renderContextStates = new Map<number, Map<symbol, unknown>>();

/** Symbol name registry: Map<symbol, string> for serialization */
const symbolNames = new Map<string, symbol>();

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
export const createStateKey = <T>(key: string): StateKey<T> => {
  const symbol = Symbol(key) as StateKey<T>;
  symbolNames.set(key, symbol);
  return symbol;
};

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
  // Create render context state
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

/**
 * Captures all State values for a render context during SSR.
 *
 * This function iterates through all State values stored for the given render context,
 * and captures only the non-derived Seidr instances. The result is a record mapping
 * string keys (from the symbol names) to the Seidr values.
 *
 * @param renderContextID - Render context ID
 * @returns Record mapping string keys to non-derived Seidr values
 *
 * @example
 * ```typescript
 * // During SSR
 * const USER_KEY = createStateKey<Seidr<string>>("user");
 * setState(USER_KEY, new Seidr("Alice"));
 *
 * const state = captureRenderContextState(ctx.renderContextID);
 * // Returns: { "user": "Alice" }
 * ```
 */
export function captureRenderContextState(renderContextID: number): Record<string, unknown> {
  const ctxStates = renderContextStates.get(renderContextID);
  if (!ctxStates) {
    return {};
  }

  const captured: Record<string, unknown> = {};
  const reverseSymbolNames = new Map<symbol, string>();
  symbolNames.entries().forEach(([key, symbol]) => reverseSymbolNames.set(symbol, key));

  // Iterate through all State values
  for (const [symbol, value] of ctxStates.entries()) {
    const key = reverseSymbolNames.get(symbol);

    // Only include non-derived Seidr instances
    if (key && isSeidr(value) && !value.isDerived) {
      captured[key] = value.value;
    }
  }

  return captured;
}

/**
 * Restores State values for a render context during hydration.
 *
 * This function takes the captured state from SSR and restores it to the
 * render context's State storage. It uses the symbol name registry to
 * map string keys back to their original symbols.
 *
 * @param renderContextID - Render context ID
 * @param state - Record of string keys to values from SSR
 *
 * @example
 * ```typescript
 * // During hydration
 * const USER_KEY = createStateKey<Seidr<string>>("user");
 *
 * restoreRenderContextState(ctx.renderContextID, { "user": "Alice" });
 *
 * const user = getState<Seidr<string>>(USER_KEY);
 * // user.value is now "Alice"
 * ```
 */
export function restoreRenderContextState(renderContextID: number, state: Record<string, unknown>): void {
  // Ensure the render context has a State storage
  if (!renderContextStates.has(renderContextID)) {
    renderContextStates.set(renderContextID, new Map());
  }

  const ctxStates = renderContextStates.get(renderContextID)!;

  // Iterate through the captured state
  for (const [name, value] of Object.entries(state)) {
    // Find the symbol for this name
    let targetSymbol: symbol | undefined;

    for (const [key, symbol] of symbolNames.entries()) {
      if (key === name) {
        targetSymbol = symbol;
        break;
      }
    }

    if (!targetSymbol) {
      // Skip values without registered symbols
      continue;
    }

    // Check if there's already a State value for this symbol
    const existingValue = ctxStates.get(targetSymbol);

    // If it's a Seidr instance, update its value
    if (isSeidr(existingValue)) {
      existingValue.value = value;
    } else {
      // Initialize new Seidr
      ctxStates.set(targetSymbol, new Seidr(value));
    }
  }
}
