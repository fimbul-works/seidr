import { getAppState } from "../../app-state/get-app-state.js";
import { getMarkerRegistry } from "../../component/component-registry.js";
import { isMarkerComment } from "../../component/type-guards.js";
import type { SeidrComponent } from "../../component/types.js";
import { getMarkerText } from "../../component/util/get-marker-comments.js";
import {
  DATA_KEY_HYDRATION_CTX,
  SEIDR_COMPONENT_END_PREFIX,
  SEIDR_COMPONENT_START_PREFIX,
  SEIDR_ROOT_MARKER_PREFIX,
  TAG_COMMENT,
  TAG_COMPONENT_PREFIX,
  TAG_TEXT,
} from "../../constants.js";
import { isCommentNode, isElementNode, isTextNode } from "../../dom/type-guards.js";
import { SeidrError } from "../../types.js";
import { reconstructComponentTree } from "../structure/reconstruct-component-tree.js";
import type { ComponentTreeNode, StructureMapTuple } from "../structure/types.js";
import { getHydrationData } from "./storage.js";
import type { HydrationContext, HydrationMismatchNode } from "./types.js";

/**
 * Get the active hydration context from AppState.
 * @returns {HydrationContext | undefined} The active hydration context object
 */
export const getHydrationContext = (): HydrationContext | undefined =>
  getAppState().getData<HydrationContext>(DATA_KEY_HYDRATION_CTX);

/**
 * Clear the active hydration context from AppState.
 */
export const clearHydrationContext = (): boolean => getAppState().deleteData(DATA_KEY_HYDRATION_CTX);

/**
 * Initialize hydration context.
 *
 * @param {Element} container - Container DOM element
 * @returns {HydrationContext} The initialized hydration context object
 * @throws {SeidrError} if hydration data is invalid
 */
export function initHydrationContext(container: Element): HydrationContext {
  const appState = getAppState();
  const hydrationData = getHydrationData();

  if (!hydrationData?.components) {
    throw new SeidrError("Hydration data missing or invalid components mapping");
  }

  // Construct normalized component map
  const components: Record<string, StructureMapTuple[]> = {};
  for (const key in hydrationData.components) {
    const parts = key.split(":");
    const componentId = parts.length > 1 ? parts.slice(1).join(":") : key;
    components[componentId] = hydrationData.components[key];
  }

  // Find the actual root nodes rendered by SSR via ctxID boundary markers
  const allNodes = Array.from(container.childNodes);
  const startMarkerText = `${SEIDR_COMPONENT_START_PREFIX}${SEIDR_ROOT_MARKER_PREFIX}${hydrationData.ctxID}`;
  const endMarkerText = `${SEIDR_COMPONENT_END_PREFIX}${SEIDR_ROOT_MARKER_PREFIX}${hydrationData.ctxID}`;

  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (isCommentNode(node)) {
      const text = node.textContent;
      if (startIdx === -1 && text === startMarkerText) {
        startIdx = i;
      } else if (startIdx !== -1 && text === endMarkerText) {
        endIdx = i;
        break;
      }
    }
  }

  let rootStartMarker: Comment | undefined;
  let rootEndMarker: Comment | undefined;
  let rootNodes: ChildNode[];

  if (startIdx !== -1 && endIdx !== -1) {
    rootStartMarker = allNodes[startIdx] as Comment;
    rootEndMarker = allNodes[endIdx] as Comment;
    rootNodes = allNodes.slice(startIdx + 1, endIdx);
  } else {
    // Fallback for legacy/hand-authored HTML without ctxID root markers
    let firstIdx = -1;
    let lastIdx = -1;
    for (let i = 0; i < allNodes.length; i++) {
      const node = allNodes[i];
      if (isMarkerComment(node)) {
        if (firstIdx === -1) firstIdx = i;
        lastIdx = i;
      }
    }
    rootNodes = firstIdx === -1 ? allNodes : allNodes.slice(firstIdx, lastIdx + 1);
  }

  // Reconstruct virtual tree from tuples AND sync with DOM in one pass
  const componentTree = reconstructComponentTree(rootNodes, components);

  // Wrap in a root component node
  const rootComponentId = Object.keys(components)[0] || "Root";
  const fullComponentTree: ComponentTreeNode[] = [
    {
      tag: `${TAG_COMPONENT_PREFIX}${rootComponentId}`,
      id: rootComponentId,
      creationIndex: -1,
      children: componentTree,
      isMismatched: false,
    },
  ];

  // Map all component nodes by ID for quick access
  const componentNodeMap = new Map<string, ComponentTreeNode>();
  const flatten = (nodes: ComponentTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.id) {
        componentNodeMap.set(node.id, node);
      }
      if (node.children) {
        flatten(node.children);
      }
    });
  };
  flatten(fullComponentTree);

  // Derive claimMap for each component
  const claimMap = new Map<string, ChildNode[]>();

  const getFirstPhysicalNode = (node: ComponentTreeNode): ChildNode | undefined => {
    if (node.domNode) return node.domNode;
    if (node.children && node.children.length > 0) {
      return getFirstPhysicalNode(node.children[0]);
    }
    return undefined;
  };

  for (const componentId of Object.keys(components)) {
    const node = componentNodeMap.get(componentId);
    if (!node) {
      console.warn(`[seidr:hydration] Component ${componentId} not found in tree!`);
      continue;
    }

    const tuples = components[componentId];
    const claimNodes: ChildNode[] = new Array(tuples.length);

    const visit = (nodes: ComponentTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.creationIndex >= 0 && n.creationIndex < claimNodes.length) {
          const physicalNode = n.domNode || getFirstPhysicalNode(n);
          claimNodes[n.creationIndex] = physicalNode!;
        }

        // Recurse into element children, but stop at sub-components
        if (!n.id && n.children) {
          visit(n.children);
        }
      });
    };

    if (node.children) {
      visit(node.children);
    }

    claimMap.set(componentId, claimNodes);
  }

  const treeStack: ComponentTreeNode[] = [];
  const cursors = new Map<string, number>();
  let currentComponentNode: ComponentTreeNode | null = null;

  // Construct the hydration context object
  const ctx: HydrationContext = {
    rootStartMarker,
    rootEndMarker,
    pushComponent(component: SeidrComponent) {
      const compIdStr = getMarkerText(component);
      let node = componentNodeMap.get(compIdStr);

      if (!node && treeStack.length === 0) {
        // Positional match for the root component
        node = fullComponentTree[0];
        if (node?.id && compIdStr !== node.id) {
          const markers = getMarkerRegistry().get(node.id);
          if (markers) {
            getMarkerRegistry().set(compIdStr, markers);
          }
        }
      }

      const isMatchedInSSR = Boolean(node);

      // If component is not in SSR map, create a virtual mismatched node to keep stack balance
      if (!node) {
        node = {
          tag: `${TAG_COMPONENT_PREFIX}${compIdStr}`,
          id: compIdStr,
          creationIndex: -1,
          isMismatched: true,
          children: [],
        };
      }

      // Increment parent's cursor only when the pushed child actually exists in the SSR structure map
      if (currentComponentNode && isMatchedInSSR) {
        const parentId = currentComponentNode.id!;
        const parentTuples = components[parentId];
        if (node.creationIndex >= 0 && parentTuples?.[node.creationIndex]?.[0] === node.tag) {
          cursors.set(parentId, node.creationIndex + 1);
        } else {
          this.next();
        }
      }

      treeStack.push(node);
      currentComponentNode = node;

      if (!cursors.has(node.id!)) {
        cursors.set(node.id!, 0);
      }
    },
    popComponent() {
      treeStack.pop();
      currentComponentNode = treeStack[treeStack.length - 1] ?? null;
    },
    removeComponent(component: SeidrComponent) {
      const compIdStr = getMarkerText(component);
      componentNodeMap.delete(compIdStr);

      const walk = (nodeId: string) => {
        const node = componentNodeMap.get(nodeId);
        if (node?.children) {
          node.children.forEach((child) => {
            if (child.id) {
              componentNodeMap.delete(child.id);
              walk(child.id);
            }
          });
        }
      };

      walk(compIdStr);
    },
    next() {
      if (currentComponentNode?.id) {
        const current = cursors.get(currentComponentNode.id) || 0;
        cursors.set(currentComponentNode.id, current + 1);
      }
    },
    isMismatched() {
      return currentComponentNode?.isMismatched ?? false;
    },
    claim<T extends ChildNode>(tag: string): T {
      if (!currentComponentNode) {
        throw new SeidrError(`No active component in hydration context, expected to claim: ${tag}`);
      }

      const componentId = currentComponentNode.id!;
      const tuples = components[componentId] || [];
      const nodes = claimMap.get(componentId) || [];
      let cursor = cursors.get(componentId) || 0;

      while (cursor < tuples.length && tuples[cursor]?.[0]?.startsWith(TAG_COMPONENT_PREFIX)) {
        cursor++;
      }

      const node = nodes[cursor];

      // Advance cursor past claimed slot
      cursors.set(componentId, cursor + 1);

      if (!node) {
        console.error(`[Hydration] No node found at ${componentId}[${cursor}], expected: ${tag}`);
        if (currentComponentNode) {
          currentComponentNode.isMismatched = true;
        }
        return null as unknown as T;
      }

      let mismatch = false;
      let actualTag = "";

      if (tag === TAG_TEXT) {
        if (!isTextNode(node)) {
          mismatch = true;
          actualTag = node.nodeName;
        }
      } else if (tag === TAG_COMMENT) {
        if (!isCommentNode(node)) {
          mismatch = true;
          actualTag = node.nodeName;
        }
      } else if (isElementNode(node)) {
        if (node.tagName.toLowerCase() !== tag.toLowerCase()) {
          mismatch = true;
          actualTag = node.tagName;
        }
      } else {
        mismatch = true;
        actualTag = node.nodeName;
      }

      if (mismatch) {
        console.warn(`[seidr:hydration] Mismatch at ${componentId}[${cursor}]: expected ${tag}, got: ${actualTag}.`);
        if (currentComponentNode) {
          currentComponentNode.isMismatched = true;
        }

        (node as HydrationMismatchNode).isHydrationMismatch = true;
      }

      return node as unknown as T;
    },
  };

  appState.setData(DATA_KEY_HYDRATION_CTX, ctx);
  return ctx;
}
