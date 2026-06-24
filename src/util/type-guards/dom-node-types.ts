import {
  SEIDR_COMPONENT_END_PREFIX,
  SEIDR_COMPONENT_START_PREFIX,
  TYPE_COMMENT_NODE,
  TYPE_ELEMENT,
  TYPE_TEXT_NODE,
} from "../../constants.js";
import { isObj } from "./primitive-types.js";

/**
 * Check if a value is a Comment node.
 * @param {any} v - Value to check
 * @returns {v is Comment} `true` if the value is a Comment, `false` otherwise
 */
export const isComment = (v: any): v is Comment => isDOMNode(v) && v.nodeType === TYPE_COMMENT_NODE;

/**
 * Check if a value is a DOM node.
 * @param {any} v - Value to check
 * @returns {v is Node} `true` if the value is a DOM node, `false` otherwise
 */
export const isDOMNode = (v: any): v is Node => isObj<Node>(v) && "nodeType" in v;

/**
 * Check if a value is an HTMLElement (safely works in Node.js/SSR environments).
 * @template K - The tag name of the HTMLElement
 * @param {any} v - Value to check
 * @returns {v is HTMLElement} `true` if the value is an HTMLElement or its server-side equivalent, `false` otherwise
 */
export const isHTMLElement = <K extends keyof HTMLElementTagNameMap | string>(
  v: any,
): v is K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement =>
  isDOMNode(v) && v.nodeType === TYPE_ELEMENT;

/**
 * Check if a value is a Text node.
 * @param {any} v - Value to check
 * @returns {v is Text} `true` if the value is a Text node, `false` otherwise
 */
export const isTextNode = (v: any): v is Text => isDOMNode(v) && v.nodeType === TYPE_TEXT_NODE;

/**
 * Check if a CharacterData node contains alphanumeric characters.
 * @param {CharacterData} node
 * @returns {boolean} `true` if the CharacterData node contains alphanumeric characters, `false` otherwise
 */
const hasWord = (node: CharacterData) => /[A-Za-z0-9]+/.test(node.textContent);

/**
 * Check if a value is a Seidr component boundary start marker comment (`<!--$Component-1-->`)
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a start marker comment, `false` otherwise.
 */
export const isStartMarkerComment = (v: any): boolean =>
  isComment(v) && v.textContent.startsWith(SEIDR_COMPONENT_START_PREFIX) && hasWord(v);

/**
 * Check if a value is a Seidr component boundary end marker comment (`<!--/Component-1-->`).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an end marker comment, `false` otherwise.
 */
export const isEndMarkerComment = (v: any): boolean =>
  isComment(v) && v.textContent.startsWith(SEIDR_COMPONENT_END_PREFIX) && hasWord(v);

/**
 * Check if a value is a Seidr component boundary marker comment (e.g. `<!--$Component-1-->` or `<!--/Component-1-->`).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a marker comment, `false` otherwise.
 */
export const isMarkerComment = (v: any): boolean => isStartMarkerComment(v) || isEndMarkerComment(v);
