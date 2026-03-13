import { TAG_TEXT } from "../../constants";
import { isHTMLElement, isMarkerComment, isTextNode } from "../../util/type-guards/dom-node-types";
import type { ComponentDomTree, ComponentTreeNode } from "./types";

/**
 * Recursively builds the ComponentDomTree, unifying virtual structure and physical DOM nodes.
 *
 * @param componentNodes - The virtual component tree nodes (reconstructed from StructureMap)
 * @param domNodes - The physical DOM nodes corresponding to the component's root
 * @param componentId - The ID of the component being built
 * @param parentTree - The optional parent ComponentDomTree
 * @returns An object containing the built ComponentDomTree and the number of physical nodes consumed
 */
export const buildComponentDomTree = (
  componentNodes: ComponentTreeNode[],
  domNodes: ChildNode[],
  componentId: string,
  parentTree?: ComponentDomTree,
): { tree: ComponentDomTree; consumedCount: number } => {
  const tree: ComponentDomTree = {
    id: componentId,
    claimNodes: [],
    claimCursor: 0,
    children: new Map(),
    parent: parentTree,
  };

  // Store temporarily mapped nodes by creationIndex to linearize them later
  const claimMap = new Map<number, ChildNode>();

  const walk = (nodes: ComponentTreeNode[], physicalNodes: ChildNode[]): number => {
    let rawIndex = 0;

    const advanceToNextValidNode = () => {
      while (
        rawIndex < physicalNodes.length &&
        ((isTextNode(physicalNodes[rawIndex]) &&
          (!physicalNodes[rawIndex].nodeValue || physicalNodes[rawIndex].nodeValue?.trim() === "")) ||
          isMarkerComment(physicalNodes[rawIndex]))
      ) {
        rawIndex++;
      }
    };

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      advanceToNextValidNode();

      if (node.id) {
        const result = buildComponentDomTree(node.children || [], physicalNodes.slice(rawIndex), node.id, tree);
        tree.children.set(node.id, result.tree);
        rawIndex += result.consumedCount;
        continue;
      }

      const physicalNode = physicalNodes[rawIndex];
      if (!physicalNode) {
        console.warn(
          `[Hydration] Missing DOM node for component ${componentId} at creationIndex ${node.creationIndex}`,
        );
        break;
      }

      claimMap.set(node.creationIndex, physicalNode);

      if (node.tag === TAG_TEXT && isTextNode(physicalNode)) {
        const nextNode = nodes[i + 1];
        // Text nodes might be merged in SSR rendered HTML output
        if (nextNode && nextNode.tag === TAG_TEXT) {
          continue;
        }
      }

      rawIndex++;

      if (node.children && node.children.length > 0 && isHTMLElement(physicalNode)) {
        walk(node.children, Array.from(physicalNode.childNodes));
      }
    }

    advanceToNextValidNode();
    return rawIndex;
  };

  const consumedCount = walk(componentNodes, domNodes);

  // Linearize into a dense array, dropping gaps left by component boundaries.
  // Sorting by creationIndex perfectly guarantees we match chronological instantiation
  // order during bottom-up JS evaluation!
  const sortedIndices = Array.from(claimMap.keys()).sort((a, b) => a - b);
  tree.claimNodes = sortedIndices.map((idx) => claimMap.get(idx)!);

  return { tree, consumedCount };
};
