import { encodeBase62 } from "@fimbul-works/futhark";
import type { SeidrComponent } from "../../component/types.js";
import { TAG_COMMENT, TAG_COMPONENT_PREFIX, TAG_TEXT } from "../../constants.js";
import { isComment, isHTMLElement, isTextNode } from "../../dom/type-guards.js";
import { isComponent, isMarkerComment } from "../../component/type-guards.js";
import { SeidrError } from "../../types.js";
import type { StructureMapTuple } from "./types.js";

/**
 * Collects all root physical nodes of a component.
 * @param {SeidrComponent} comp - Component to collect root nodes from
 * @returns {Node[]} Array of root DOM nodes
 */
function collectRootNodes(comp: SeidrComponent): Node[] {
  if (comp.nodes && comp.nodes.length > 0) {
    return comp.nodes;
  }
  return [];
}

/**
 * Builds a structure map for the given component.
 *
 * @param {SeidrComponent} component - The component to build the structure map for
 * @returns {StructureMapTuple[]} An array of tuples representing the structure of the component
 */
export function buildStructureMap(component: SeidrComponent): StructureMapTuple[] {
  const createdIndex = (component as any).createdIndex as (ChildNode | SeidrComponent)[] | undefined;
  if (!createdIndex || createdIndex.length === 0) {
    return [];
  }

  const childCreatedIndex = ((component as any).childCreatedIndex as Map<Node | SeidrComponent, string>) || new Map();

  // Collect child component root nodes
  const rootNodeSets = new Map<SeidrComponent, Set<Node>>();
  for (const childComponent of component.children.values()) {
    rootNodeSets.set(childComponent, new Set(collectRootNodes(childComponent)));
  }

  // Build root nodes to component map
  const rootNodeToComponent = new Map<Node, SeidrComponent>();
  for (const [childComponent, roots] of rootNodeSets) {
    for (const root of roots) {
      rootNodeToComponent.set(root, childComponent);
    }
  }

  // First pass: map each created item to its index
  const indexMap = new Map<Node | SeidrComponent, number>();

  let index = 0;
  createdIndex.forEach((child) => {
    // If boundary found, we skip the index
    const boundaryId = childCreatedIndex.get(child);
    if (boundaryId) {
      return;
    }

    // Increment index
    indexMap.set(child, index++);

    // Check if child element is parent of any child component
    if (isHTMLElement(child)) {
      const childComponent = rootNodeToComponent.get(child);
      if (childComponent) {
        // Record component boundary
        childCreatedIndex.set(child, String(childComponent.id));
      }
    }
  });

  // Second pass: construct structure tuples
  const tuples: StructureMapTuple[] = [];
  createdIndex.forEach((child) => {
    // Skip child components by boundary
    if (childCreatedIndex.has(child)) {
      return;
    }

    // Construct tuples
    if (isComponent(child)) {
      const compIdStr =
        process.env.NODE_ENV === "production" ? encodeBase62(child.id) : `${child.name}-${encodeBase62(child.id)}`;
      tuples.push([`${TAG_COMPONENT_PREFIX}${compIdStr}`]);
    } else if (isHTMLElement(child)) {
      const tuple: StructureMapTuple = [child.tagName.toLowerCase()];
      if (child.childNodes && child.childNodes.length > 0) {
        const seenChildComponents = new Set<SeidrComponent>();
        for (let i = 0; i < child.childNodes.length; i++) {
          const domChild = child.childNodes[i];

          const childComp = rootNodeToComponent.get(domChild);
          if (childComp) {
            if (!seenChildComponents.has(childComp)) {
              seenChildComponents.add(childComp);
              const idx = indexMap.get(childComp);
              if (idx !== undefined) {
                tuple.push(idx);
              }
            }
            continue;
          }

          if (isMarkerComment(domChild)) {
            continue;
          }

          const idx = indexMap.get(domChild as ChildNode);
          if (idx !== undefined) {
            tuple.push(idx);
          }
        }
      }
      tuples.push(tuple);
    } else if (isTextNode(child)) {
      tuples.push([TAG_TEXT]);
    } else if (isComment(child)) {
      if (isMarkerComment(child)) {
        return;
      }
      const val = child.nodeValue || child.textContent || "";
      tuples.push([val.startsWith(TAG_COMMENT) ? `${TAG_COMMENT}:${val}` : TAG_COMMENT]);
    } else {
      throw new SeidrError("Unknown component child", { cause: child });
    }
  });

  return tuples;
}
