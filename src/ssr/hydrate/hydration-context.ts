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
    if (tuple[0].startsWith("#component:")) return;

    let domChildIdx = 0;
    const children = Array.from(parentNode.childNodes);

    for (let i = 1; i < tuple.length; i++) {
      const childMapIdx = tuple[i] as number;
      const expectedTag = structureMap[childMapIdx][0];

      let domChild = children[domChildIdx];

      // Skip whitespace/unrelated nodes
      while (domChild && !nodeMatches(domChild, expectedTag)) {
        domChildIdx++;
        domChild = children[domChildIdx];
      }

      if (domChild) {
        resolved[childMapIdx] = domChild;
        resolveChildren(childMapIdx);
        domChildIdx++;
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[Hydration Mismatch] Could not find physical node for tag "${expectedTag}" at map index ${childMapIdx}. Parent node:`,
            parentNode,
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
    return this.resolvedNodes[this.currentIndex++];
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
    candidate = parentCtx.claimBoundary(componentId);
  } else if (container) {
    // Top-level hydration. Look for root elements or markers in the container.
    const numericId = componentId.split("-").pop();
    const selector = `[data-seidr-id="${numericId}"]`;
    const el = container.querySelector(selector);
    if (el) return [el];

    // Check for markers in top-level
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT);
    let node: Comment | null = walker.nextNode() as Comment;
    while (node) {
      if (node.textContent?.includes(`#${componentId}`)) {
        candidate = node;
        break;
      }
      node = walker.nextNode() as Comment;
    }
  }

  if (candidate) {
    if (isComment(candidate) && candidate.textContent?.includes(`#${componentId}`)) {
      // It's a start marker. The roots are the siblings until the end marker.
      const roots: Node[] = [];
      let sibling = candidate.nextSibling;
      const endTag = `/${componentId}`;
      while (sibling) {
        if (isComment(sibling) && sibling.textContent?.includes(endTag)) {
          break;
        }
        roots.push(sibling);
        sibling = sibling.nextSibling;
      }
      return roots;
    }
    return [candidate];
  }

  return [];
}
