import { HYDRATION_ID_ATTRIBUTE, ROOT_ATTRIBUTE, TAG_COMMENT, TAG_COMPONET_PREFIX, TAG_TEXT } from "../../constants";
import { isComment, isHTMLElement, isTextNode } from "../../util/type-guards/dom-node-types";
import type { StructureMapTuple } from "../structure/types";
import { getHydrationData, getHydrationMap } from "./storage";

/**
 * Checks if a physical DOM node matches a structure map tag.
 */
function nodeMatches(node: Node, tag: string): boolean {
  if (tag === TAG_TEXT) return isTextNode(node);
  if (tag.startsWith(TAG_COMMENT)) {
    if (tag.includes(":")) {
      const expected = tag.split(":")[1];
      return isComment(node) && node.nodeValue === expected;
    }
    return isComment(node);
  }
  if (tag.startsWith(TAG_COMPONET_PREFIX)) {
    const id = tag.split(":")[1];
    // Component boundaries can be markers (comments) or elements with data-seidr-id
    if (isComment(node)) {
      // Match markers like <!--#ID--> or <!--List:ID-->
      return node.nodeValue?.endsWith(id) ?? false;
    }
    if (isHTMLElement(node)) {
      if (id === node.getAttribute(HYDRATION_ID_ATTRIBUTE)) {
        return true;
      }

      // Fallback: check if this is a passthrough component whose first child matches
      const hData = getHydrationData()?.data;
      let currentId = id;

      while (currentId) {
        const compMap = hData?.components?.[currentId];
        if (!compMap || compMap.length === 0) break;

        const rootTuple = compMap[0];
        const descendantTag = rootTuple[0];

        if (descendantTag.startsWith(TAG_COMPONET_PREFIX)) {
          const descendantId = descendantTag.split(":")[1];
          if (descendantId === node.getAttribute(HYDRATION_ID_ATTRIBUTE)) {
            return true;
          }
          currentId = descendantId;
        } else {
          break;
        }
      }
    }
    return false;
  }
  // Standard element
  return isHTMLElement(node) && node.tagName.toLowerCase() === tag.toLowerCase();
}

/**
 * Resolves all nodes in a structure map to their corresponding physical DOM nodes.
 * @param structureMap The flat structure map from SSR
 * @param roots Initial root elements of the component
 */
export function resolveNodes(structureMap: StructureMapTuple[], roots: Node[]): Node[] {
  const hydrationMap = getHydrationMap();
  const resolved = new Array<Node | undefined>(structureMap.length);
  const isChild = new Set<number>();

  for (const tuple of structureMap) {
    for (let i = 1; i < tuple.length; i++) {
      isChild.add(tuple[i] as number);
    }
  }

  const rootsInMap = structureMap.map((_, i) => i).filter((i) => !isChild.has(i));

  // Recursive resolution function
  const resolve = (mapIdx: number, domNode: Node) => {
    if (resolved[mapIdx]) return;
    resolved[mapIdx] = domNode;
    hydrationMap.set(domNode, domNode);

    const tuple = structureMap[mapIdx];
    const tag = tuple[0];

    // Component boundaries are placeholders in the parent map
    if (tag.startsWith(TAG_COMPONET_PREFIX)) return;

    // Resolve children topologicaly
    if (tuple.length > 1) {
      const children = Array.from(domNode.childNodes);
      let domSearchIdx = 0;

      for (let i = 1; i < tuple.length; i++) {
        const childMapIdx = tuple[i] as number;
        const expectedTag = structureMap[childMapIdx][0];

        for (let j = domSearchIdx; j < children.length; j++) {
          if (nodeMatches(children[j], expectedTag)) {
            resolve(childMapIdx, children[j]);
            domSearchIdx = j + 1;
            break;
          }
        }
      }
    }
  };

  // Resolve starting from roots
  let domRootIdx = 0;
  for (const rootMapIdx of rootsInMap) {
    const expectedTag = structureMap[rootMapIdx][0];
    for (let j = domRootIdx; j < roots.length; j++) {
      if (nodeMatches(roots[j], expectedTag)) {
        resolve(rootMapIdx, roots[j]);
        domRootIdx = j + 1;
        break;
      }
    }
  }

  return resolved as Node[];
}

/**
 * HydrationContext provides a sequential way to consume resolved nodes
 * during component rendering.
 */
export class HydrationContext {
  private resolvedNodes: Node[];
  private currentIndex = 0;
  public lastAttemptedNode: Node | undefined;

  constructor(
    public readonly componentId: string,
    structureMap: StructureMapTuple[],
    roots: Node[],
  ) {
    this.resolvedNodes = resolveNodes(structureMap, roots);
  }

  /**
   * Consumes the next node in the execution sequence.
   * @param expectedTag Optional tag to verify against (e.g. "div", TAG_TEXT, TAG_COMPONET_PREFIX+"ID")
   */
  claim(expectedTag?: string): Node | undefined {
    const node = this.resolvedNodes[this.currentIndex++];
    this.lastAttemptedNode = node;

    if (expectedTag && node) {
      if (!nodeMatches(node, expectedTag)) {
        if (process.env.DEBUG_HYDRATION)
          console.warn(`[${this.componentId}] mismatch at index ${this.currentIndex - 1}`);
        return undefined;
      }
    }

    return node;
  }

  /**
   * Specifically claims a component boundary node.
   */
  claimBoundary(id: string): Node | undefined {
    const node = this.peek();

    if (!node) return undefined;

    const numericId = id.split("-").pop();
    if (
      nodeMatches(node, `${TAG_COMPONET_PREFIX}${id}`) ||
      (numericId && nodeMatches(node, `${TAG_COMPONET_PREFIX}${numericId}`))
    ) {
      return this.claim();
    }
    return undefined;
  }

  /**
   * Peek at the next node without consuming it.
   */
  peek(): Node | undefined {
    return this.resolvedNodes[this.currentIndex];
  }

  /**
   * Returns true if all nodes have been claimed.
   */
  get isDone(): boolean {
    return this.currentIndex >= this.resolvedNodes.length;
  }
}

let activeContext: HydrationContext | null = null;
const contextStack: HydrationContext[] = [];

/**
 * Gets the current active hydration context.
 * @param depth Optional depth to go back in the stack (0 = current, 1 = parent, etc.)
 */
export function getHydrationContext(depth: number = 0): HydrationContext | null {
  if (depth === 0) return activeContext;
  return contextStack[contextStack.length - depth] || null;
}

/**
 * Pushes a new hydration context onto the stack.
 */
export function pushHydrationContext(ctx: HydrationContext): void {
  contextStack.push(ctx);
  activeContext = ctx;
}

/**
 * Pops the current hydration context.
 */
export function popHydrationContext(): void {
  contextStack.pop();
  activeContext = contextStack[contextStack.length - 1] || null;
}

/**
 * Discovers the physical DOM roots for a component being hydrated.
 * It does this by using the actual hydration Map of components to figure out what DOM
 * nodes and component boundaries we expect, looking at the hydration structure recursively.
 */
export function getRootsForHydration(componentId: string, container?: HTMLElement): Node[] {
  const hydrationDataStorage = getHydrationData();
  const hData = hydrationDataStorage?.data;

  if (!hData || !hData.components) {
    return [];
  }

  const parentCtx = getHydrationContext();
  let candidate: Node | undefined;

  // 1. Contextual discovery: if we are within a parent parsing its children sequentially
  if (parentCtx) {
    candidate = parentCtx.claimBoundary(componentId);
  }

  // 2. Data Driven Discovery: if we are building the top-level tree or context failed
  if (!candidate && container) {
    const compMap = hData.components[componentId];
    if (compMap && compMap.length > 0) {
      // Look at the first element/node in the structure map
      const rootTuple = compMap[0];
      const rootTag = rootTuple[0];

      // Array/Fragment with markers
      if (rootTag.startsWith(TAG_COMMENT)) {
        const text = rootTag.replace(`${TAG_COMMENT}:`, "");

        // Find start marker
        let startMarker: Comment | undefined;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (node.textContent?.trim() === text) {
            startMarker = node as Comment;
            break;
          }
        }

        if (startMarker) {
          const endLabel = `/${text}`;
          const nodes: Node[] = [startMarker];
          let current = startMarker.nextSibling;
          while (current) {
            nodes.push(current);
            if (isComment(current) && current.textContent === endLabel) {
              break;
            }
            current = current.nextSibling;
          }
          return nodes;
        }
      }

      // Natively wraps a child component (passthrough)
      if (rootTag.startsWith(TAG_COMPONET_PREFIX)) {
        const descendantId = rootTag.split(":")[1];
        return getRootsForHydration(descendantId, container);
      }

      // Natively wraps a single DOM element
      const numericId = componentId.split("-").pop() || "";
      const ctxSelector = !parentCtx && hData.ctxID ? `[${ROOT_ATTRIBUTE}~="${hData.ctxID}"]` : "";
      const idSelector = `[${HYDRATION_ID_ATTRIBUTE}~="${numericId}"]`;

      // 1. Try finding by ctxID on container or children (primary for root components)
      if (ctxSelector) {
        const el = container.matches?.(ctxSelector) ? container : container.querySelector(ctxSelector);
        if (isHTMLElement(el)) {
          // Verify it's actually for this component if possible
          if (el.getAttribute(HYDRATION_ID_ATTRIBUTE) === numericId || el.hasAttribute(HYDRATION_ID_ATTRIBUTE)) {
            return [el];
          }
        }
      }

      // 2. Fallback to finding by component ID
      const el = container.matches?.(idSelector) ? container : container.querySelector(idSelector);
      if (el) {
        return [el];
      }
    }
  }

  if (candidate) {
    // If the candidate was claimed from context and it's a marker, return full range
    if (isComment(candidate)) {
      const text = candidate.textContent || "";
      if (!text.startsWith("/")) {
        const endLabel = `/${text}`;
        const nodes: Node[] = [candidate];
        let current = candidate.nextSibling;
        while (current) {
          nodes.push(current);
          if (isComment(current) && current.textContent === endLabel) {
            break;
          }
          current = current.nextSibling;
        }
        return nodes;
      }
    }
    return [candidate];
  }

  return [];
}
