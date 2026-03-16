import type { Component } from "../../component/types";
import { collectRootNodes } from "../../component/util/collect-root-nodes";
import { TAG_COMMENT, TAG_COMPONENT_PREFIX, TAG_TEXT } from "../../constants";
import { SeidrError } from "../../types";
import { isComment, isComponent, isHTMLElement, isTextNode } from "../../util/type-guards";
import type { StructureMapTuple } from "./types";

/**
 * Builds a structure map for the given component.
 *
 * @param {Component} component - The component to build the structure map for
 * @returns {StructureMapTuple[]} An array of tuples representing the structure of the component
 */
export function buildStructureMap(component: Component): StructureMapTuple[] {
  // Collect child component root nodes
  const rootNodeSets = new Map<Component, Set<Node>>();
  for (const childComponent of component.children.values()) {
    rootNodeSets.set(childComponent, new Set(collectRootNodes(childComponent)));
  }

  // Build root nodes to component map
  const rootNodeToComponent = new Map<Node, Component>();
  for (const [childComponent, roots] of rootNodeSets) {
    for (const root of roots) {
      rootNodeToComponent.set(root, childComponent);
    }
  }

  // First pass: record parent nodes and component boundaries
  const indexMap = new Map<Node | Component, number>();
  const childParents = new Map<Node | Component, ParentNode>();

  let index = 0;
  component.createdIndex.forEach((child) => {
    // If boundary found, we skip the index
    const boundaryId = component.childCreatedIndex.get(child);
    if (boundaryId) {
      return;
    }

    // Track parent node
    if (child.parentNode) {
      childParents.set(child, child.parentNode!);
    }

    // Increment index
    indexMap.set(child, index++);

    // Check if child element is parent of any child component
    if (isHTMLElement(child)) {
      const childComponent = rootNodeToComponent.get(child);
      if (childComponent) {
        // Record component boundary
        component.childCreatedIndex.set(child, childComponent.id);
        return;
      }
    }
  });

  // Inverse parent node map for faster lookup
  const parentChildren = childParents.entries().reduce((acc, [child, parent]) => {
    if (!acc.has(parent)) {
      acc.set(parent, new Set());
    }
    acc.get(parent)!.add(child);
    return acc;
  }, new Map<ParentNode, Set<Node | Component>>());

  // Second pass: construct structure tuples
  const tuples: StructureMapTuple[] = [];
  component.createdIndex.forEach((child) => {
    // Skip child components by boundary
    if (component.childCreatedIndex.has(child)) {
      return;
    }

    // Construct tuples
    if (isComponent(child)) {
      tuples.push([`${TAG_COMPONENT_PREFIX}${child.id}`]);
    } else if (isHTMLElement(child)) {
      const tuple: StructureMapTuple = [child.tagName.toLowerCase()];
      // Check if child is a parent node
      if (parentChildren.has(child)) {
        for (const childOfParent of parentChildren.get(child)!) {
          const index = indexMap.get(childOfParent)!;
          if (index === undefined) {
            continue;
          }
          // Add child indices to the element tuple
          tuple.push(index);
        }
      }
      tuples.push(tuple);
    } else if (isTextNode(child)) {
      tuples.push([TAG_TEXT]);
    } else if (isComment(child)) {
      tuples.push([child.nodeValue!.startsWith(TAG_COMMENT) ? `${TAG_COMMENT}:${child.nodeValue}` : TAG_COMMENT]);
    } else {
      throw new SeidrError("Unknown component child", { cause: child });
    }
  });

  return tuples;
}
