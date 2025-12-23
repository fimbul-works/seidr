import { type Attributes, ServerHTMLElement } from "./server-element.js";

/**
 * Server-side element creator that mirrors the client-side API
 */
export const $ = <K extends string>(
  tagName: K,
  props?: Attributes,
  children?: (ServerHTMLElement | string)[],
): ServerHTMLElement => new ServerHTMLElement(tagName, { ...props }, children || []);
