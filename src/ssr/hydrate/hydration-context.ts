import { isComment, isHTMLElement, isTextNode } from "../../util/type-guards/dom-node-types";
import type { StructureMapTuple } from "../structure/structure-map";

/**
 * Checks if a physical DOM node matches a structure map tag.
 */
function nodeMatches(node: Node, tag: string): boolean {
  if (tag === "#text") return isTextNode(node);
  if (tag === "#comment") return isComment(node);
  if (tag.startsWith("#component:")) {
    // Component boundaries can be markers (comments) or elements with data-seidr-id
    if (isComment(node)) {
      const id = tag.split(":")[1];
      // Match markers like <!--#ID--> or <!--List:ID-->
      return node.textContent?.includes(id) ?? false;
    }
    if (isHTMLElement(node)) {
      const id = tag.split(":")[1];
      return node.getAttribute("data-seidr-id") === id;
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
  const resolved = new Array<Node>(structureMap.length);
  const isChild = new Set<number>();

  for (const tuple of structureMap) {
    for (let i = 1; i < tuple.length; i++) {
      isChild.add(tuple[i] as number);
    }
  }

  const rootsInMap = structureMap.map((_, i) => i).filter((i) => !isChild.has(i));

  // 1. Assign roots
  rootsInMap.forEach((mapIdx, elementIdx) => {
    if (roots[elementIdx]) {
      resolved[mapIdx] = roots[elementIdx];
    }
  });

  // 2. Recursive resolution from roots
  const resolveChildren = (parentIdx: number) => {
    const parentNode = resolved[parentIdx];
    if (!parentNode) return;

    const tuple = structureMap[parentIdx];
    // We used to return early here if tuple[0].startsWith("#component:"),
    // but child component boundaries (like Fragments) HAVE children (markers/li)
    // in the parent's structure map that must be resolved!

    let domChildIdx = 0;
    const children = Array.from((parentNode as ParentNode).childNodes || []);

    for (let i = 1; i < tuple.length; i++) {
      const childMapIdx = tuple[i] as number;
      const expectedTag = structureMap[childMapIdx][0];

      let matchedNode: Node | null = null;
      let searchIdx = domChildIdx;

      while (children[searchIdx]) {
        if (nodeMatches(children[searchIdx], expectedTag)) {
          matchedNode = children[searchIdx];
          break;
        }
        searchIdx++;
      }

      if (matchedNode) {
        resolved[childMapIdx] = matchedNode;
        resolveChildren(childMapIdx);
        // Advance the primary index past the matched node
        domChildIdx = searchIdx + 1;
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[Hydration mismatch] WHAT: Failed to resolve component DOM boundary.\n` +
              `HOW: The client generated a structure map containing "${expectedTag}" at index ${childMapIdx} but the physical node was missing.\n` +
              `WHERE: Component structure resolution inside ${parentNode ? (parentNode as HTMLElement).tagName || "Node" : "null"}.\n` +
              `WHY: The HTML from the server may have been altered by a browser extension, malformed, or conditional state didn't match between client and server.\n` +
              `ACTION: The structure map node resolution failed, which might cause subsequent nodes to fail hydration mappings.`,
            { parentNode, expectedTag, childMapIdx },
          );
        }
      }
    }
  };

  rootsInMap.forEach(resolveChildren);

  return resolved;
}

/**
 * HydrationContext provides a sequential way to consume resolved nodes
 * during component rendering.
 */
export class HydrationContext {
  private resolvedNodes: Node[];
  private currentIndex = 0;

  constructor(
    public readonly componentId: string,
    structureMap: StructureMapTuple[],
    roots: Node[],
  ) {
    this.resolvedNodes = resolveNodes(structureMap, roots);
  }

  /**
   * Consumes the next node in the execution sequence.
   */
  claim(): Node | undefined {
    const node = this.resolvedNodes[this.currentIndex++];
    if (node) {
      const tag = isHTMLElement(node)
        ? (node as HTMLElement).tagName
        : isTextNode(node)
          ? "#text"
          : isComment(node)
            ? "#comment"
            : "unknown";
      console.log(`[Hydration debug] [${this.componentId}] Claimed node index ${this.currentIndex - 1}: <${tag}>`);
    }
    return node;
  }

  /**
   * Specifically claims a component boundary node.
   */
  claimBoundary(id: string): Node | undefined {
    const node = this.peek();
    if (node && nodeMatches(node, `#component:${id.split("-").pop()}`)) {
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
 */
export function getHydrationContext(): HydrationContext | null {
  return activeContext;
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
 */
export function getRootsForHydration(componentId: string, container?: HTMLElement): Node[] {
  const parentCtx = getHydrationContext();
  let candidate: Node | undefined;

  if (parentCtx) {
    // RESOLUTION via Marker-Position (Parent Structure Map)
    candidate = parentCtx.claimBoundary(componentId);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Hydration debug] [${componentId}] Resolved boundary from parent: ${candidate ? candidate.nodeName : "NONE"}`,
      );
    }
  } else if (container) {
    // Top-level discovery (Data-selector or Marker-search)
    const numericId = componentId.split("-").pop();
    const selector = `[data-seidr-id="${numericId}"]`;
    const el = container.matches?.(selector) ? container : container.querySelector(selector);
    if (el) {
      candidate = el;
    }

    if (!candidate) {
      // Check for markers in top-level
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.textContent === componentId) {
          candidate = node;
          break;
        }
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Hydration debug] [${componentId}] Top-level discovery in container: ${candidate ? candidate.nodeName : "NONE"}`,
      );
    }
  }

  if (!candidate) return [];

  // If candidate is a start marker, return the full range until the end marker
  if (isComment(candidate)) {
    const text = candidate.textContent || "";
    // Boundary match (e.g. Component-1 or List-2)
    if (!text.startsWith("/")) {
      const endLabel = "/" + text;
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
