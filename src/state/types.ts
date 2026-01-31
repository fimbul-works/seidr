/**
 * Type-safe state key that carries its type
 *
 * @template T - State type
 */
export type StateKey<T> = symbol & { readonly __type?: T };

// Extract generic from instance
export type InferStateType<C> = C extends StateKey<infer T> ? T : never;
