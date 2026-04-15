import { getAppState } from "../../app-state/app-state.js";
import type { Component } from "../../component/types.js";
import {
  DATA_KEY_HYDRATION_CONTEXT,
  ROOT_ATTRIBUTE,
  TAG_COMMENT,
  TAG_COMPONENT_PREFIX,
  TAG_TEXT,
} from "../../constants.js";
import { registerStateStrategy } from "../../seidr/register-state-strategy.js";
import { SeidrError } from "../../types.js";
import { isComment, isHTMLElement, isTextNode } from "../../util/type-guards/dom-node-types.js";
import { isEmpty } from "../../util/type-guards/primitive-types.js";
import { reconstructComponentTree } from "../structure/reconstruct-component-tree.js";
import type { ComponentTreeNode, StructureMapTuple } from "../structure/types.js";
import { getHydrationData } from "./storage.js";
import type { HydrationContext, HydrationMismatchNode } from "./types.js";

/**
 * Get the active hydration context from AppState.
 * @returns
 */
export const getHydrationContext = () => getAppState().getData<HydrationContext>(DATA_KEY_HYDRATION_CONTEXT);

/**
 * Initialize hydration context.
 *
 * @param {Element} container - Container DOM element
 * @returns {HydrationContext} The initialized hydratin context object
 * @throws {SeidrError} if hydration data is invalid
 * @throws {SeidrError} if no root nodes can be found in DOM
 */
export function initHydrationContext(container: Element) {
  const appState = getAppState();
  const hydrationData = getHydrationData();
  if (isEmpty(hydrationData?.components)) {
    throw new SeidrError("Invalid hydration data");
  }

  // Ensure state strategy is registered
  registerStateStrategy(appState);

  // Construct normalized component
  const components: Record<string, StructureMapTuple[]> = {};
  for (const key in hydrationData.components) {
    const parts = key.split(":");
    const componentId = parts.length > 1 ? parts.slice(1).join(":") : key;
    components[componentId] = hydrationData.components[key];
  }

  // Find the actual root nodes rendered by SSR (they have the ROOT_ATTRIBUTE)
  const rootNodes = Array.from(container.querySelectorAll(`[${ROOT_ATTRIBUTE}="${hydrationData.ctxID}"]`));
  if (!rootNodes) {
    throw new SeidrError("No root nodes found");
  }

  // Reconstruct virtual tree from tuples AND sync with DOM in one pass
  const componentTree = reconstructComponentTree(rootNodes, components);

  // Wrap in a root component node to satisfy the componentNodeMap lookup
  const rootComponentId = Object.keys(components)[0];
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
    const compNode = componentNodeMap.get(componentId);
    if (!compNode) {
      console.warn(`[Hydration] Component ${componentId} not found in tree!`);
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

    if (compNode.children) {
      visit(compNode.children);
    }

    claimMap.set(componentId, claimNodes);
  }

  const treeStack: ComponentTreeNode[] = [];
  const cursors = new Map<string, number>();
  let currentComponentNode: ComponentTreeNode | null = null;

  // Construct the hydration context object
  const ctx: HydrationContext = {
    pushComponent(component: Component) {
      let node = componentNodeMap.get(component.id);

      if (!node && treeStack.length === 0) {
        // Positional match for the root component
        node = fullComponentTree[0];
      }

      // If component is not in SSR map, create a virtual mismatched node to keep stack balance
      if (!node) {
        node = {
          tag: `${TAG_COMPONENT_PREFIX}${component.id}`,
          id: component.id,
          creationIndex: -1,
          isMismatched: true,
          children: [],
        };
      }

      // Increment parent's cursor before pushing child
      if (currentComponentNode) {
        this.next();
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
    removeComponent(component: Component) {
      // Remove the component from the map so it's no longer hydrated
      componentNodeMap.delete(component.id);

      // Recursively remove children maps if they exist
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

      walk(component.id);
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
      const cursor = cursors.get(componentId) || 0;
      const nodes = claimMap.get(componentId) || [];
      const node = nodes[cursor];

      // ALWAYS advance cursor if we tried to claim
      this.next();

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
        if (!isComment(node)) {
          mismatch = true;
          actualTag = node.nodeName;
        }
      } else if (isHTMLElement(node)) {
        if (node.tagName.toLowerCase() !== tag) {
          mismatch = true;
          actualTag = node.tagName;
        }
      } else {
        mismatch = true;
        actualTag = node.nodeName;
      }

      if (mismatch) {
        console.warn(`[Hydration] Mismatch at ${componentId}[${cursor}]: expected ${tag}, got ${actualTag}.`);
        if (currentComponentNode) {
          currentComponentNode.isMismatched = true;
        }

        // Return the original node but mark as mismatched
        (node as HydrationMismatchNode).isHydrationMismatch = true;
      }

      return node as unknown as T;
    },
  };

  appState.setData(DATA_KEY_HYDRATION_CONTEXT, ctx);
  return ctx;
}
