import { getAppState } from "../../../app-state";
import type { Component } from "../../../component";
import { ROOT_ATTRIBUTE, TAG_COMPONENT_PREFIX, TAG_TEXT } from "../../../constants";
import { SeidrError } from "../../../types";
import { isEmpty } from "../../../util/type-guards/primitive-types";
import { reconstructComponentTree } from "../../structure/reconstruct-component-tree";
import type { ComponentTreeNode, StructureMapTuple } from "../../structure/types";
import { getHydrationData, isHydrating } from "../storage";
import { type HydrationContext, HydrationMismatchError, type HydrationTreeNode } from "./types";

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

export const createHydrationContext = (
  container: Element,
  map: Record<string, StructureMapTuple[]>,
): HydrationContext => {
  const data = getHydrationData()?.data;

  const rootNodes = container.querySelectorAll(`[${ROOT_ATTRIBUTE}="${data?.ctxID}"]`);
  if (rootNodes.length === 0) {
    throw new SeidrError("Root node not found");
  }

  const componentTree = reconstructComponentTree(map);
  if (rootNodes.length !== 1) {
    throw new SeidrError("Root node not found");
  }

  console.log(map);

  let domIndex = 0;

  const buildHydrationMap = (node: ComponentTreeNode) => {
    const result: HydrationTreeNode[] = [];
    if (node.tag === TAG_TEXT) {
      const resultNode: HydrationTreeNode = {
        ...node,
        node: rootNodes[domIndex],
      };
      result.push(resultNode);
      domIndex++;
    }
    if (node.tag.startsWith(TAG_COMPONENT_PREFIX)) {
      const resultNode: HydrationTreeNode = {
        ...node,
        children: [],
      };
      result.push(resultNode);
    }
    result;
  };

  const cursors = new Map<string, number>();
  const componentStack: string[] = [];
  let currentComponent: string = Object.keys(map)[0];

  const initCursors = () => {
    Object.keys(map).forEach((componentId) => {
      cursors.set(componentId, 0);
    });
  };

  const incrementCursor = (componentId: string) => {
    cursors.set(componentId, cursors.get(componentId)! + 1);
  };

  initCursors();

  console.log(JSON.stringify(componentTree, null, 2));

  const ctx: HydrationContext = {
    pushComponent(component: Component) {
      console.log("PUSH", currentComponent, ">", component.id);
      componentStack.push(component.id);
      currentComponent = component.id;
      console.log("tuples", JSON.stringify(map[component.id], null, 2));
    },
    popComponent() {
      const prev = componentStack.pop();
      currentComponent = componentStack[componentStack.length - 1] ?? null;
      console.log("POP", currentComponent, "<", prev);
    },
    next() {
      console.log("next");
    },
    markSubtreeMismatched() {
      console.log("markSubtreeMismatched");
    },
    claim<T extends ChildNode>(tag: string): T | null {
      const nextTag = map[currentComponent]?.[cursors.get(currentComponent)!]?.[0];
      console.log("claiming", tag, "vs", nextTag);
      if (tag !== nextTag) {
        throw new HydrationMismatchError("Tag mismatch");
      }
      return null as unknown as T;
    },
  };

  // const markerMap = new Map<string, Comment>();
  // const scanMarkers = (node: Node) => {
  //   if (isMarkerComment(node)) {
  //     const text = node.nodeValue || "";
  //     markerMap.set(text, node);
  //   } else if (node.childNodes && node.childNodes.length > 0) {
  //     Array.from(node.childNodes).forEach(scanMarkers);
  //   }
  // };
  // Array.from(container.childNodes).forEach(scanMarkers);

  // const componentTree = reconstructComponentTree(map);
  // const dirtyPrefixes = new Set<string>();

  // let rootTree: ComponentDomTree | undefined;
  // if (rootNodes.length > 0 && componentTree.length > 0) {
  //   const rootComponentId = Object.keys(map)[0];
  //   const rootDomNodes = Array.from(rootNodes) as ChildNode[];
  //   const result = buildComponentDomTree(componentTree, rootDomNodes, rootComponentId);
  //   rootTree = result.tree;
  // }

  // let currentTree: ComponentDomTree | undefined;

  // const describeNode = (node: Node) => {
  //   if (isTextNode(node)) return "#text";
  //   if (isComment(node)) return "#comment";
  //   if (isHTMLElement(node))
  //     return (
  //       "<" +
  //       node.nodeName.toLowerCase() +
  //       (node.id ? ` id="${node.id}"` : "") +
  //       (node.className ? ` class="${node.className}"` : "") +
  //       ">"
  //     );
  //   return "Unknown";
  // };

  // const ctx: HydrationContext = {
  //   get currentNode() {
  //     return null;
  //   },
  //   get currentDomNode() {
  //     return currentTree ? currentTree.claimNodes[currentTree.claimCursor] : (undefined as any);
  //   },
  //   get domPath() {
  //     return [];
  //   },
  //   next() {
  //     if (currentTree) {
  //       currentTree.claimCursor++;
  //     }
  //   },
  //   claimComponentMarkers(componentId: string) {
  //     return {
  //       startMarker: markerMap.get(`${SEIDR_COMPONENT_START_PREFIX}${componentId}`) || null,
  //       endMarker: markerMap.get(`${SEIDR_COMPONENT_END_PREFIX}${componentId}`) || null,
  //     };
  //   },
  //   pushComponent(component: Component) {
  //     if (!currentTree) {
  //       currentTree = rootTree;
  //     } else {
  //       const childTree = currentTree.children.get(component.id);
  //       if (childTree) {
  //         currentTree = childTree;
  //       } else {
  //         console.warn(`[Hydration] Child component tree not found for ${component.id}`);
  //       }
  //     }
  //     if (currentTree) {
  //       currentTree.claimCursor = 0; // Reset cursor for this component's evaluation phase
  //     }
  //   },
  //   popComponent() {
  //     if (currentTree?.parent) {
  //       currentTree = currentTree.parent;
  //     }
  //   },
  //   pushNode() {},
  //   popNode() {},
  //   markSubtreeMismatched() {
  //     if (currentTree) {
  //       dirtyPrefixes.add(`${currentTree.id}:${currentTree.claimCursor}`);
  //     }
  //   },
  //   claim<T extends ChildNode = ChildNode>(tag: string): T | undefined {
  //     if (!currentTree) {
  //       throw new SeidrError("No current component tree in hydration context");
  //     }

  //     const cursor = currentTree.claimCursor;
  //     const mappedNode = currentTree.claimNodes[cursor];

  //     if (!mappedNode) {
  //       throw new HydrationMismatchError(
  //         `Hydration mismatch: Node missing at creation index ${cursor} for component ${currentTree.id}`,
  //       );
  //     }

  //     // Validate Tag Mismatches
  //     let isMismatch = false;
  //     if (tag === TAG_TEXT) {
  //       if (!isTextNode(mappedNode)) {
  //         isMismatch = true;
  //       }
  //     } else if (tag.startsWith(TAG_COMMENT)) {
  //       if (!isComment(mappedNode)) {
  //         isMismatch = true;
  //       }
  //     } else if (isHTMLElement(mappedNode)) {
  //       if (mappedNode.nodeName.toLowerCase() !== tag.toLowerCase()) {
  //         isMismatch = true;
  //       }
  //     } else {
  //       isMismatch = true;
  //     }

  //     if (isMismatch) {
  //       throw new HydrationMismatchError(
  //         `Hydration mismatch: Expected <${tag}> but found ${describeNode(mappedNode)} at cursor ${cursor} for component ${currentTree.id}`,
  //       );
  //     }

  //     ctx.next();
  //     return mappedNode as T;
  //   },
  // };

  return ctx;
};
