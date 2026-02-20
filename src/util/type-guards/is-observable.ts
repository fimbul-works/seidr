import { Seidr } from "../../seidr/seidr";

/**
 * Check if a value is a Seidr class instance.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr class instance, `false` otherwise
 */
export const isSeidr = <T>(v: any): v is Seidr<T> => v instanceof Seidr;
