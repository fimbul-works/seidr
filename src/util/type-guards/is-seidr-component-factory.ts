import type { SeidrComponentFactory } from "../../dom/component/types";

/**
 * Check if a value is a Seidr component factory.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component factory, `false` otherwise
 */
export const isSeidrComponentFactory = <P>(v: any): v is SeidrComponentFactory<P> => v && v.isComponentFactory === true;
