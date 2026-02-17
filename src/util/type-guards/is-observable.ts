import { SEIDR_WEAVE, TYPE_PROP } from "../../constants";
import { Seidr } from "../../seidr/seidr";
import type { Weave } from "../../seidr/seidr-weave";
import { isObj } from "./primitive-types";

/**
 * Check if a value is a Seidr class instance.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr class instance, `false` otherwise
 */
export const isSeidr = <T = any>(v: any): v is Seidr<T> => v instanceof Seidr;

/**
 * Check if a value is a Weave instance.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Weave instance, `false` otherwise
 */
export const isWeave = <T extends object = object>(v: any): v is Weave<T> =>
  isObj(v) && (v as Weave<T>)[TYPE_PROP] === SEIDR_WEAVE;
