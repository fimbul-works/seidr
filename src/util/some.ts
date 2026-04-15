/**
 * Check if any element in a list matches the predicate.
 *
 * @template T - Type of items in the list
 * @template A - Dynamic type determned by the type of `T`
 * @param {T[]} nodes - Array to check
 * @param {(v: T) => boolean} predicateFn - Predicate function
 * @returns {boolean} `true` if any item in the array matches the predicate, `false` otherwise
 */
export const some = <T, A = T extends Node ? NodeListOf<T> : Array<T>>(
  nodes: A,
  predicateFn: (v: T) => boolean,
): boolean => Array.prototype.some.call(nodes, predicateFn);
