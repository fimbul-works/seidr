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
      const attr = node.getAttribute("data-seidr-id") || "";
      const ids = attr.split(" ");
      // Match full ID ("Home-3") or numeric ID ("3")
      return ids.includes(id) || ids.some((item) => item === id || item.split("-").pop() === id);
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
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[Hydration-Resolve] structureMap length: ${structureMap.length}, rootsInMap:`,
      rootsInMap,
      "roots from getRootsForHydration:",
      roots.length,
    );
  }

  // 1. Initial Mapping of Roots (Flat Sequence)
  // These mapping indices correspond to the components' top-level nodes (roots).
  let domRootIdx = 0;
  for (const rootIdx of rootsInMap) {
    const expectedTag = structureMap[rootIdx][0];
    let matchedNode: Node | null = null;
    let searchIdx = domRootIdx;

    while (roots[searchIdx]) {
      const matches = nodeMatches(roots[searchIdx], expectedTag);
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[Hydration-Resolve] Checking rootIdx ${rootIdx} (${expectedTag}) against roots[${searchIdx}] (${isHTMLElement(roots[searchIdx]) ? (roots[searchIdx] as HTMLElement).tagName : roots[searchIdx].nodeName}): ${matches}`,
        );
      }
      if (matches) {
        matchedNode = roots[searchIdx];
        break;
      }
      searchIdx++;
    }

    if (matchedNode) {
      resolved[rootIdx] = matchedNode;
      domRootIdx = searchIdx + 1;
    } else if (roots[domRootIdx]) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Hydration-Resolve] Fallback for rootIdx ${rootIdx} from roots[${domRootIdx}]`);
      }
      // Fallback
      resolved[rootIdx] = roots[domRootIdx];
      domRootIdx++;
    }
  }

  // 2. Recursive resolution for children of already resolved nodes
  const resolveChildren = (idx: number) => {
    const parentNode = resolved[idx];
    if (!parentNode || !isHTMLElement(parentNode)) return;

    const tuple = structureMap[idx];
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
        domChildIdx = searchIdx + 1;
      } else if (children[domChildIdx]) {
        resolved[childMapIdx] = children[domChildIdx];
        domChildIdx++;
      }
    }
  };

  rootsInMap.forEach((idx) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Hydration-Resolve] Root index ${idx} resolved to ${resolved[idx]?.nodeName}`);
    }
    resolveChildren(idx);
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Hydration-Resolve] Finished resolving ${structureMap.length} nodes for component`);
    resolved.forEach((node, i) => {
      console.log(
        `  [${i}] ${structureMap[i][0]} -> ${node?.nodeName} ${isHTMLElement(node) ? (node as HTMLElement).id || (node as HTMLElement).tagName : ""}`,
      );
    });
  }

  return resolved;
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
   * @param expectedTag Optional tag to verify against (e.g. "div", "#text", "#component:ID")
   */
  claim(expectedTag?: string): Node | undefined {
    const node = this.resolvedNodes[this.currentIndex++];
    this.lastAttemptedNode = node;

    if (expectedTag && node) {
      if (!nodeMatches(node, expectedTag)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[Hydration mismatch] Expected <${expectedTag}> at index ${this.currentIndex - 1}, but found <${
              isHTMLElement(node) ? (node as HTMLElement).tagName.toLowerCase() : node.nodeName.toLowerCase()
            }>. This node will be replaced.`,
          );
        }
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
    if (nodeMatches(node, `#component:${id}`) || (numericId && nodeMatches(node, `#component:${numericId}`))) {
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
 */
export function getRootsForHydration(componentId: string, container?: HTMLElement): Node[] {
  const parentCtx = getHydrationContext();
  let candidate: Node | undefined;

  if (parentCtx) {
    // RESOLUTION via Marker-Position (Parent Structure Map)
    candidate = parentCtx.claimBoundary(componentId);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Hydration-Roots] ${componentId} candidate from parentCtx:`, candidate?.nodeName);
    }
  } else if (container) {
    // Top-level discovery: Prefer Markers if they exist, then fallback to Data-selector
    const numericId = componentId.split("-").pop() || "";
    const lookFor = [componentId, numericId];
    if (numericId) lookFor.push(`#${numericId}`);
    lookFor.push(`#${componentId}`);

    // 1. Marker search (direct children first, then descendants)
    // Direct children
    const nodes = Array.from(container.childNodes);
    for (const node of nodes) {
      if (isComment(node) && lookFor.includes(node.textContent?.trim() || "")) {
        candidate = node;
        break;
      }
    }

    // Descendants
    if (!candidate) {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (lookFor.includes(node.textContent?.trim() || "")) {
          candidate = node;
          break;
        }
      }
    }

    if (candidate && process.env.NODE_ENV !== "production") {
      console.log(
        `[Hydration-Roots] ${componentId} candidate from marker search ('${candidate.textContent}'):`,
        candidate.nodeName,
      );
    }

    // 2. Data-selector fallback if no markers found
    if (!candidate) {
      const selector = `[data-seidr-id~="${numericId}"]`;
      const el = container.matches?.(selector) ? container : container.querySelector(selector);
      if (el) {
        candidate = el;
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `[Hydration-Roots] ${componentId} candidate from selector ${selector}:`,
            candidate.nodeName,
            (candidate as HTMLElement).getAttribute("data-seidr-id"),
          );
        }
      }
    }
  }

  if (!candidate && process.env.NODE_ENV !== "production") {
    console.log(
      `[Hydration-Roots] ${componentId} - NO CANDIDATE FOUND in container ${container?.id || container?.tagName}`,
    );
  }

  if (!candidate) return [];

  // If candidate is a start marker, return the full range until the end marker (excluding markers)
  if (isComment(candidate)) {
    const text = candidate.textContent || "";
    // Boundary match (e.g. Component-1 or List-2)
    if (!text.startsWith("/")) {
      const endLabel = `/${text}`;
      const nodes: Node[] = [];
      let current = candidate.nextSibling;
      while (current) {
        if (isComment(current) && current.textContent === endLabel) {
          break;
        }
        nodes.push(current);
        current = current.nextSibling;
      }
      return nodes;
    }
  }

  return [candidate];
}
