import { getAppState } from "../../../app-state";
import type { Component } from "../../../component";
import { ROOT_ATTRIBUTE, TAG_COMMENT, TAG_TEXT, HYDRATION_CONTEXT_KEY } from "../../../constants";
import { SeidrError } from "../../../types";
import { isComment, isHTMLElement, isTextNode } from "../../../util/type-guards/dom-node-types";
import { isEmpty } from "../../../util/type-guards/primitive-types";
import { reconstructComponentTree } from "../../structure/reconstruct-component-tree";
import type { ComponentTreeNode, StructureMapTuple } from "../../structure/types";
import { getHydrationData, isHydrating } from "../storage";
import type { HydrationContext, HydrationMismatchNode } from "./types";

export const getHydrationContext = () => getAppState().getData<HydrationContext>(HYDRATION_CONTEXT_KEY);

export const initHydrationContext = () => {
  if (!isHydrating()) {
    throw new SeidrError("Not hydrating");
  }

  const data = getHydrationData()?.data;
  if (isEmpty(data?.components)) {
    throw new SeidrError("Invalid hydration data");
  }

  const normalizedComponents: Record<string, StructureMapTuple[]> = {};
  for (const key in data.components) {
    const parts = key.split(":");
    const compId = parts.length > 1 ? parts.slice(1).join(":") : key;
    normalizedComponents[compId] = data.components[key];
  }

  const ctx = createHydrationContext(data.root!, normalizedComponents);
  getAppState().setData(HYDRATION_CONTEXT_KEY, ctx);
  return ctx;
};

export const createHydrationContext = (
  container: Element,
  map: Record<string, StructureMapTuple[]>,
): HydrationContext => {
  const data = getHydrationData()?.data;

  // Find the actual root nodes rendered by SSR (they have the ROOT_ATTRIBUTE)
  const rootNodes = Array.from(container.querySelectorAll(`[${ROOT_ATTRIBUTE}="${data?.ctxID}"]`));
  if (!rootNodes) {
    throw new SeidrError("No root nodes found");
  }

  // Reconstruct virtual tree from tuples AND sync with DOM in one pass
  const componentTree = reconstructComponentTree(rootNodes, map);

  // Wrap in a root component node to satisfy the componentNodeMap lookup
  const rootComponentId = Object.keys(map)[0];
  const fullComponentTree: ComponentTreeNode[] = [
    {
      tag: `$${rootComponentId}`,
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

  for (const componentId of Object.keys(map)) {
    const compNode = componentNodeMap.get(componentId);
    if (!compNode) {
      console.warn(`[HYDRATE] WARNING: Component ${componentId} not found in tree!`);
      continue;
    }

    const tuples = map[componentId];
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
  let currentComponentNode: ComponentTreeNode | null = null;
  const cursors = new Map<string, number>();

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
          tag: `$${component.id}`,
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
        throw new SeidrError("No active component in hydration context");
      }

      const componentId = currentComponentNode.id!;
      const cursor = cursors.get(componentId) || 0;
      const nodes = claimMap.get(componentId) || [];
      const node = nodes[cursor];

      // ALWAYS advance cursor if we tried to claim
      this.next();

      if (!node) {
        console.error(`!!!! [Hydration mismatch] No node found at ${componentId}[${cursor}]`);
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
        actualTag = "UNKNOWN";
      }

      if (mismatch) {
        console.warn(`[Hydration mismatch] at ${componentId}[${cursor}]: expected ${tag}, got ${actualTag}.`);
        if (currentComponentNode) {
          currentComponentNode.isMismatched = true;
        }
        // Return the original node but mark as mismatched
        (node as HydrationMismatchNode).isHydrationMismatch = true;
      }

      return node as unknown as T;
    },
  };

  return ctx;
};
