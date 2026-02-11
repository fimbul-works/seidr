import { TYPE_COMMENT_NODE, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { isObj } from "./primitive-types";

/**
 * Check if a value is a Comment node.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Comment, `false` otherwise
 */
export const isComment = (v: any): v is Comment => isDOMNode(v) && v.nodeType === TYPE_COMMENT_NODE;

/**
 * Check if a value is a DOM node.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a DOM node, `false` otherwise
 */
export const isDOMNode = (v: any): v is Node => isObj<Node>(v) && "nodeType" in v;

/**
 * Check if a value is an HTMLElement (safely works in Node.js/SSR environments).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an HTMLElement or its server-side equivalent, `false` otherwise
 */
export const isHTMLElement = (v: any): v is HTMLElement => isDOMNode(v) && v.nodeType === TYPE_ELEMENT;

/**
 * Check if a value is a Text node.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Text node, `false` otherwise
 */
export const isTextNode = (v: any): v is Text => isDOMNode(v) && v.nodeType === TYPE_TEXT_NODE;
