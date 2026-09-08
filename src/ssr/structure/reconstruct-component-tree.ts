import { getAppState } from "../../app-state/app-state.js";
import { TAG_COMMENT, TAG_COMPONENT_PREFIX, TAG_TEXT } from "../../constants.js";
import { isComment, isHTMLElement, isTextNode } from "../../dom/type-guards.js";
import { isMarkerComment } from "../../component/type-guards.js";
import type { ComponentTreeNode, StructureMapTuple } from "./types.js";

/**
 * Builds a complete virtual DOM tree from hydration component data while
 * simultaneously synchronizing with physical DOM nodes.
 */
export const reconstructComponentTree = (
  rootNodes: ChildNode[],
  componentStructures: Record<string, StructureMapTuple[]>,
): ComponentTreeNode[] => {
  const rootComponentId = Object.keys(componentStructures)[0];

  // State for synchronization
  let currentDomNodes = rootNodes;
  let currentDomIndex = 0;

  const skipMarkers = () => {
    while (currentDomIndex < currentDomNodes.length) {
      const node = currentDomNodes[currentDomIndex];
      if (isMarkerComment(node)) {
        const data = (node as Comment).data || (node as Comment).textContent || "";
        const isStart = data.startsWith(TAG_COMPONENT_PREFIX);
        const id = isStart ? data.slice(TAG_COMPONENT_PREFIX.length) : data.slice(1);

        const state = getAppState();
        const markers = state.markers.get(id) || ([null, null] as unknown as [Comment, Comment]);
        if (isStart) {
          markers[0] = node as Comment;
        } else {
          markers[1] = node as Comment;
        }
        state.markers.set(id, markers);
        currentDomIndex++;
      } else {
        break;
      }
    }
  };

  /**
   * Recursive builder that consumes DOM nodes from the CURRENT sibling list.
   */
  const buildTree = (componentId: string, isTreeMismatched: boolean = false): ComponentTreeNode[] => {
    const tuples = componentStructures[componentId];
    if (!tuples) {
      return [];
    }

    // Identify roots of THIS component
    const isInnerChild = new Set<number>();
    tuples.forEach((tuple) => {
      const [tag, ...indices] = tuple;
      if (!tag.startsWith(TAG_COMPONENT_PREFIX)) {
        indices.forEach((childIdx) => isInnerChild.add(childIdx));
      }
    });

    const buildNode = (creationIndex: number, isMismatched: boolean = isTreeMismatched): ComponentTreeNode => {
      const [tag, ...indices] = tuples[creationIndex];
      const id = tag.startsWith(TAG_COMPONENT_PREFIX) ? tag.slice(TAG_COMPONENT_PREFIX.length) : undefined;

      skipMarkers();

      const node: ComponentTreeNode = { creationIndex, tag, isMismatched };

      if (id) {
        node.id = id;
        node.children = buildTree(id, node.isMismatched);
      } else {
        const domNode = currentDomNodes[currentDomIndex];
        node.domNode = domNode;
        if (domNode) {
          // Check for mismatch
          if (isHTMLElement(domNode)) {
            if (tag !== domNode.tagName.toLowerCase()) {
              console.warn(
                `[Hydration] Tag mismatch at index ${creationIndex}: expected ${tag}, got ${domNode.tagName.toLowerCase()}`,
                node,
                domNode,
              );
              node.isMismatched = true;
            }
          } else if (isTextNode(domNode)) {
            if (tag !== TAG_TEXT) {
              node.isMismatched = true;
            }
          } else if (isComment(domNode)) {
            if (tag !== TAG_COMMENT) {
              node.isMismatched = true;
            }
          }
        }
        currentDomIndex++;

        if (indices.length > 0 || (domNode && domNode.childNodes.length > 0)) {
          const savedNodes = currentDomNodes;
          const savedIndex = currentDomIndex;
          currentDomNodes = domNode ? Array.from(domNode.childNodes) : [];
          currentDomIndex = 0;
          if (indices.length > 0) {
            node.children = indices.map((idx) => buildNode(idx, node.isMismatched));
          }
          skipMarkers();
          currentDomNodes = savedNodes;
          currentDomIndex = savedIndex;
        }
      }

      return node;
    };

    const result = tuples
      .map((_, idx) => idx)
      .filter((idx) => !isInnerChild.has(idx))
      .map((idx) => buildNode(idx, isTreeMismatched));

    skipMarkers();
    return result;
  };

  return buildTree(rootComponentId);
};
