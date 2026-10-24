import { isArr, isObj } from "@fimbul-works/hvat";
import { isComponent } from "../component/type-guards.js";
import { isDOMNode } from "../dom/type-guards.js";
import { isValue } from "../observable/type-guards.js";
import type { SeidrChild } from "./types.js";

/**
 * Check if a value is a valid Seidr child.
 *
 * @param {any} v - Value to check
 * @returns {v is SeidrChild | SeidrChild[]} `true` if the value is a valid Seidr child, `false` otherwise
 */
export const isValidSeidrChild = (v: any): v is SeidrChild | SeidrChild[] =>
  !isObj(v) || isArr(v) || isDOMNode(v) || isComponent(v) || isValue(v);
