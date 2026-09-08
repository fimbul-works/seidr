import {
  SEIDR_COMPONENT_END_PREFIX,
  SEIDR_COMPONENT_START_PREFIX,
  TYPE_COMPONENT,
  TYPE_COMPONENT_FACTORY,
  TYPE_PROP,
} from "../constants.js";
import { isComment } from "../dom/type-guards.js";
import { isFn, isObj } from "../util/type-guards.js";
import type { SeidrComponent, SeidrComponentFactory } from "./types.js";

/**
 * Check if a value is a Seidr component.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component, `false` otherwise
 */
export const isComponent = (v: any): v is SeidrComponent => isObj<SeidrComponent>(v) && v[TYPE_PROP] === TYPE_COMPONENT;

/**
 * Check if a value is a Seidr component factory.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component factory, `false` otherwise
 */
export const isComponentFactory = <P>(v: any): v is SeidrComponentFactory<P> =>
  isFn<SeidrComponentFactory<P>>(v) && TYPE_PROP in v && v[TYPE_PROP] === TYPE_COMPONENT_FACTORY;

/**
 * Check if a CharacterData node contains alphanumeric characters.
 *
 * @param {CharacterData} node - DOM CharacterData node to check
 * @returns {boolean} `true` if the CharacterData node contains alphanumeric characters, `false` otherwise
 */
const hasWord = (node: CharacterData) => /[A-Za-z0-9]+/.test(node.textContent);

/**
 * Check if a value is a Seidr component boundary start marker comment.
 *
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a start marker comment, `false` otherwise
 */
export const isStartMarkerComment = (v: any): boolean =>
  isComment(v) && v.textContent.startsWith(SEIDR_COMPONENT_START_PREFIX) && hasWord(v);

/**
 * Check if a value is a Seidr component boundary end marker comment.
 *
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an end marker comment, `false` otherwise
 */
export const isEndMarkerComment = (v: any): boolean =>
  isComment(v) && v.textContent.startsWith(SEIDR_COMPONENT_END_PREFIX) && hasWord(v);

/**
 * Check if a value is a Seidr component boundary marker comment.
 *
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a marker comment, `false` otherwise
 */
export const isMarkerComment = (v: any): boolean => isStartMarkerComment(v) || isEndMarkerComment(v);
