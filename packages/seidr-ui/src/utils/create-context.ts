import { isUndef } from "@fimbul-works/hvat";
import { getAppState, SeidrError } from "@fimbul-works/seidr";

/**
 * Interface for a scoped component context manager.
 */
export interface Context<T> {
  /** Name of the context used for debugging and identification */
  name: string;
  /** Push a context value onto the stack */
  push: (value: T) => void;
  /** Pop the top context value off the stack */
  pop: () => T | undefined;
  /** Get the current top context value without throwing if absent */
  get: () => T | undefined;
  /** Get the current context value or throw a helpful SeidrError if absent */
  use: () => T;
  /** Run a callback within the context value, ensuring cleanup on return */
  runWith: <R>(value: T, fn: () => R) => R;
}

/**
 * Creates an isolated context stack stored in Seidr's AppState.
 *
 * Safe for concurrent SSR renders and client-side execution.
 *
 * @template T - Type of the context value
 * @param {string} name - Name identifier for the context
 * @param {string} [errorMessage] - Optional custom error message when used outside provider
 * @returns {Context<T>}
 */
export function createContext<T>(name: string, errorMessage?: string): Context<T> {
  const stackKey = `seidr-ui.context:${name}`;

  const getStack = (): T[] => getAppState().getData<T[]>(stackKey, []);

  const push = (value: T): void => {
    getStack().push(value);
  };

  const pop = (): T | undefined => {
    return getStack().pop();
  };

  const get = (): T | undefined => {
    const stack = getStack();
    return stack.length > 0 ? stack[stack.length - 1] : undefined;
  };

  const use = (): T => {
    const value = get();
    if (isUndef(value)) {
      throw new SeidrError(
        errorMessage ?? `[seidr-ui]: use${name} must be used within a corresponding ${name} provider component.`,
      );
    }
    return value;
  };

  const runWith = <R>(value: T, fn: () => R): R => {
    push(value);
    try {
      return fn();
    } finally {
      pop();
    }
  };

  return { name, push, pop, get, use, runWith };
}
