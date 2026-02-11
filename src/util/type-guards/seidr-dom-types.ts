import type { SeidrComponent, SeidrComponentFactory } from "../../component/types";
import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_ELEMENT, TYPE_PROP } from "../../constants";
import type { SeidrElement } from "../../element";
import { isFn, isObj } from "./primitive-types";

/**
 * Check if a value is a Seidr component.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component, `false` otherwise
 */
export const isSeidrComponent = (v: any): v is SeidrComponent =>
  isObj<SeidrComponent>(v) && v[TYPE_PROP] === TYPE_COMPONENT;

/**
 * Check if a value is a Seidr component factory.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component factory, `false` otherwise
 */
export const isSeidrComponentFactory = <P>(v: any): v is SeidrComponentFactory<P> =>
  isFn<SeidrComponentFactory<P>>(v) && v[TYPE_PROP] === TYPE_COMPONENT_FACTORY;

/**
 * Check if a value is a SeidrElement extending HTMLElement.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a SeidrElement, `false` otherwise
 */
export const isSeidrElement = <T extends keyof HTMLElementTagNameMap>(v: any): v is SeidrElement<T> =>
  isObj<SeidrElement<T>>(v) && v[TYPE_PROP] === TYPE_ELEMENT;
