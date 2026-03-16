import { TAG_COMPONENT_PREFIX } from "src/constants";
import { isComponent, isComponentFactory } from ".";
import { isComment, isHTMLElement, isTextNode } from "./type-guards/dom-node-types";

/**
 * Describes a DOM node for debugging purposes.
 *
 * @param {Node} node The node to describe
 * @returns {string} The description of the node
 */
export const describeNode = (node: any) => {
  if (isTextNode(node)) return "#text";
  if (isComment(node)) return "#comment";
  if (isHTMLElement(node))
    return (
      "<" +
      node.nodeName.toLowerCase() +
      (node.id ? ` id="${node.id}"` : "") +
      (node.className ? ` class="${node.className}"` : "") +
      ">"
    );
  if (isComponent(node)) {
    return `${TAG_COMPONENT_PREFIX}${node.id}`;
  }
  if (isComponentFactory(node)) {
    return `${TAG_COMPONENT_PREFIX}factory:${node.name}`;
  }
  return "Unknown";
};
