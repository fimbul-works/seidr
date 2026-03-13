import { getAppState } from "../../../app-state";
import type { Component } from "../../../component";
import {
  ROOT_ATTRIBUTE,
  SEIDR_COMPONENT_END_PREFIX,
  SEIDR_COMPONENT_START_PREFIX,
  TAG_COMMENT,
  TAG_TEXT,
} from "../../../constants";
import { SeidrError } from "../../../types";
import { isComment, isHTMLElement, isMarkerComment, isTextNode } from "../../../util/type-guards/dom-node-types";
import { isEmpty } from "../../../util/type-guards/primitive-types";
import { buildComponentDomTree } from "../../structure/build-component-dom-tree";
import { reconstructComponentTree } from "../../structure/reconstruct-component-tree";
import type { ComponentDomTree, ComponentTreeNode, StructureMapTuple } from "../../structure/types";
import { getHydrationData, isHydrating } from "../storage";
import { type HydrationContext, HydrationMismatchError } from "./types";

export const HYDRATION_CONTEXT_KEY = "seidr.hydration.context";

export const getHydrationContext = () => getAppState().getData<HydrationContext>(HYDRATION_CONTEXT_KEY);

export const initHydrationContext = () => {
  if (!isHydrating()) {
    throw new SeidrError("Not hydrating");
  }

  const data = getHydrationData()?.data;
  if (isEmpty(data?.components)) {
    throw new SeidrError("Invalid hydration data");
  }

  const ctx = createHydrationContext(data.root!, data.components);
  getAppState().setData(HYDRATION_CONTEXT_KEY, ctx);
  return ctx;
};

export const createHydrationContext = (container: Element, map: Record<string, StructureMapTuple[]>) => {
  const data = getHydrationData()?.data;

  const rootNodes = container.querySelectorAll(`[${ROOT_ATTRIBUTE}="${data?.ctxID}"]`);
  if (rootNodes.length === 0) {
    throw new SeidrError("Root node not found");
  }

  const markerMap = new Map<string, Comment>();
  const scanMarkers = (node: Node) => {
    if (isMarkerComment(node)) {
      const text = node.nodeValue || "";
      markerMap.set(text, node);
    } else if (node.childNodes && node.childNodes.length > 0) {
      Array.from(node.childNodes).forEach(scanMarkers);
    }
  };
  Array.from(container.childNodes).forEach(scanMarkers);

  const componentTree = reconstructComponentTree(map);
  const dirtyPrefixes = new Set<string>();

  let rootTree: ComponentDomTree | undefined;
  if (rootNodes.length > 0 && componentTree.length > 0) {
    const rootComponentId = Object.keys(map)[0];
    const rootDomNodes = Array.from(rootNodes) as ChildNode[];
    const result = buildComponentDomTree(componentTree, rootDomNodes, rootComponentId);
    rootTree = result.tree;
  }

  let currentTree: ComponentDomTree | undefined;

  const describeNode = (node: Node) => {
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
    return "Unknown";
  };

  const ctx: HydrationContext = {
    get currentNode() {
      return null;
    },
    get currentDomNode() {
      return currentTree ? currentTree.claimNodes[currentTree.claimCursor] : (undefined as any);
    },
    get domPath() {
      return [];
    },
    next() {
      if (currentTree) {
        currentTree.claimCursor++;
      }
    },
    claimComponentMarkers(componentId: string) {
      return {
        startMarker: markerMap.get(`${SEIDR_COMPONENT_START_PREFIX}${componentId}`) || null,
        endMarker: markerMap.get(`${SEIDR_COMPONENT_END_PREFIX}${componentId}`) || null,
      };
    },
    pushComponent(component: Component) {
      if (!currentTree) {
        currentTree = rootTree;
      } else {
        const childTree = currentTree.children.get(component.id);
        if (childTree) {
          currentTree = childTree;
        } else {
          console.warn(`[Hydration] Child component tree not found for ${component.id}`);
        }
      }
      if (currentTree) {
        currentTree.claimCursor = 0; // Reset cursor for this component's evaluation phase
      }
    },
    popComponent() {
      if (currentTree?.parent) {
        currentTree = currentTree.parent;
      }
    },
    pushNode() {},
    popNode() {},
    markSubtreeMismatched() {
      if (currentTree) {
        dirtyPrefixes.add(`${currentTree.id}:${currentTree.claimCursor}`);
      }
    },
    claim<T extends ChildNode = ChildNode>(tag: string): T | undefined {
      if (!currentTree) {
        throw new SeidrError("No current component tree in hydration context");
      }

      const cursor = currentTree.claimCursor;
      const mappedNode = currentTree.claimNodes[cursor];

      if (!mappedNode) {
        throw new HydrationMismatchError(
          `Hydration mismatch: Node missing at creation index ${cursor} for component ${currentTree.id}`,
        );
      }

      // Validate Tag Mismatches
      let isMismatch = false;
      if (tag === TAG_TEXT) {
        if (!isTextNode(mappedNode)) {
          isMismatch = true;
        }
      } else if (tag.startsWith(TAG_COMMENT)) {
        if (!isComment(mappedNode)) {
          isMismatch = true;
        }
      } else if (isHTMLElement(mappedNode)) {
        if (mappedNode.nodeName.toLowerCase() !== tag.toLowerCase()) {
          isMismatch = true;
        }
      } else {
        isMismatch = true;
      }

      if (isMismatch) {
        throw new HydrationMismatchError(
          `Hydration mismatch: Expected <${tag}> but found ${describeNode(mappedNode)} at cursor ${cursor} for component ${currentTree.id}`,
        );
      }

      ctx.next();
      return mappedNode as T;
    },
  };

  return ctx;
};
