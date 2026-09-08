import type { Value } from "./value.js";

/**
 * @internal Only available in SSR.
 */
export let registerValueForSSR: (value: Value) => void;

/**
 * @internal Only available in SSR.
 */
export const setRegisterValueForSSR = (fn: (value: Value) => void) => {
  registerValueForSSR = fn;
};
