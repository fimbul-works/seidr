import type { SeidrComponent, SeidrComponentFactory } from "../component/types";
import type { SeidrElement, SeidrNode } from "../element/types";
import { Seidr } from "../seidr/seidr";
import { COMMENT_NODE, ELEMENT_NODE, TEXT_NODE, TYPE, TYPE_PROP } from "../types";

/**
 * Check if a value is empty (`null`, or `undefined`).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is empty, `false` otherwise
 */
export const isEmpty = (v: any): v is null | undefined => v === null || typeof v === "undefined";

/**
 * Check if a value is undefined.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is undefined, `false` otherwise
 */
export const isUndefined = (v: any): v is undefined => typeof v === "undefined";

/**
 * Check if a value is a boolean.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a boolean, `false` otherwise
 */
export const isBool = (v: any): v is boolean => typeof v === "boolean";

/**
 * Check if a value is a number.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a number, `false` otherwise
 */
export const isNum = (v: any): v is number => typeof v === "number";

/**
 * Check if a value is a string.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a string, `false` otherwise
 */
export const isStr = (v: any): v is string => typeof v === "string";

/**
 * Check if a value is a function.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a function, `false` otherwise
 */
export const isFn = <T extends (...args: any[]) => any>(v: any): v is T => typeof v === "function";

/**
 * Check if a value is an array.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an array, `false` otherwise
 */
export const isArr = <T extends any[]>(v: any): v is T => Array.isArray(v);

/**
 * Check if a value is an object.
 * @template {object} T - Type of the object
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an object, `false` otherwise
 */
export const isObj = <T extends object>(v: any): v is T => v !== null && typeof v === "object" && !isArr(v);

/**
 * Check if a value is a Seidr class instance.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr class instance, `false` otherwise
 */
export const isSeidr = <T = any>(v: any): v is Seidr<T> => v instanceof Seidr;

/**
 * Check if a value is a SeidrElement extending HTMLElement.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a SeidrElement, `false` otherwise
 */
export const isSeidrElement = <T extends keyof HTMLElementTagNameMap>(v: any): v is SeidrElement<T> =>
  v && v[TYPE_PROP] === TYPE.ELEMENT;

/**
 * Check if a value is a Seidr component.
 * @template {SeidrNode} T - Type of the component's Root Node
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component, `false` otherwise
 */
export const isSeidrComponent = <T extends SeidrNode = SeidrNode>(v: any): v is SeidrComponent<T> =>
  v && v[TYPE_PROP] === TYPE.COMPONENT;

/**
 * Check if a value is a Seidr component factory.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component factory, `false` otherwise
 */
export const isSeidrComponentFactory = <P>(v: any): v is SeidrComponentFactory<P> =>
  v && v[TYPE_PROP] === TYPE.COMPONENT_FACTORY;

/**
 * Check if a value is an HTMLElement (safely works in Node.js/SSR environments).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an HTMLElement or its server-side equivalent, `false` otherwise
 */
export const isHTMLElement = (v: any): v is HTMLElement => {
  if (typeof HTMLElement !== "undefined" && v instanceof HTMLElement) {
    return true;
  }
  return isObj(v) && "nodeType" in v && v.nodeType === ELEMENT_NODE;
};

/**
 * Check if a value is a Comment node.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Comment, `false` otherwise
 */
export const isComment = (v: any): v is Comment => {
  if (typeof Comment !== "undefined" && v instanceof Comment) {
    return true;
  }
  return isObj(v) && "nodeType" in v && v.nodeType === COMMENT_NODE;
};

/**
 * Check if a value is a Text node.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Text node, `false` otherwise
 */
export const isTextNode = (v: any): v is Text => {
  if (typeof Text !== "undefined" && v instanceof Text) {
    return true;
  }
  return isObj(v) && "nodeType" in v && v.nodeType === TEXT_NODE;
};

/**
 * Check if a value is a DOM node.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a DOM node, `false` otherwise
 */
export const isDOMNode = (v: any): v is Node => isHTMLElement(v) || isComment(v) || isTextNode(v);
