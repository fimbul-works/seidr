import { isObj } from "@fimbul-works/hvat";
import { TYPE_COMMENT_NODE, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../constants.js";
import type { SeidrElementTagNameMap } from "../element/types.js";

/**
 * Check if a value is a Comment node.
 *
 * @param {any} v - Value to check
 * @returns {v is Comment} `true` if the value is a Comment, `false` otherwise
 */
export const isCommentNode = (v: any): v is Comment => isDOMNode(v) && v.nodeType === TYPE_COMMENT_NODE;

/**
 * Check if a value is a DOM node.
 *
 * @param {any} v - Value to check
 * @returns {v is Node} `true` if the value is a DOM node, `false` otherwise
 */
export const isDOMNode = (v: any): v is Node => isObj<Node>(v) && "nodeType" in v;

/**
 * Check if a value is an Element (safely works in Node.js/SSR environments).
 *
 * @template K - The tag name of the Element
 * @param {any} v - Value to check
 * @returns {v is Element} `true` if the value is an Element or its server-side equivalent, `false` otherwise
 */
export const isElementNode = <K extends keyof SeidrElementTagNameMap | string>(
  v: any,
): v is K extends keyof SeidrElementTagNameMap ? SeidrElementTagNameMap[K] : Element =>
  isDOMNode(v) && v.nodeType === TYPE_ELEMENT;

/**
 * Check if a value is a Text node.
 *
 * @param {any} v - Value to check
 * @returns {v is Text} `true` if the value is a Text node, `false` otherwise
 */
export const isTextNode = (v: any): v is Text => isDOMNode(v) && v.nodeType === TYPE_TEXT_NODE;
