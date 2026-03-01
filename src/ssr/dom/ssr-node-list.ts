import { isStr } from "../../util/type-guards/primitive-types";
import type { ServerNode } from "./types";

/**
 * Live collection of nodes for SSR.
 * Implements the NodeList interface by wrapping an internal array.
 */
export class SSRNodeList implements NodeList {
  public readonly nodes: Node[];

  constructor(public serverNodes: ServerNode[] = []) {
    this.nodes = serverNodes as unknown as Node[];

    // biome-ignore lint/correctness/noConstructorReturn: Proxy for index-based access]
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (isStr(prop) && !Number.isNaN(Number(prop))) {
          return target.nodes[Number(prop)] || null;
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get length(): number {
    return this.nodes.length;
  }

  item(index: number): Node | null {
    return this.nodes[index] || null;
  }

  forEach(callbackfn: (value: Node, key: number, parent: NodeList) => void, thisArg?: any): void {
    this.nodes.forEach((node, index) => {
      callbackfn.call(thisArg, node, index, this as unknown as NodeList);
    });
  }

  entries(): ArrayIterator<[number, Node]> {
    return this.nodes.map((n, i) => [i, n] as [number, Node]).values();
  }

  keys(): ArrayIterator<number> {
    return this.nodes.keys();
  }

  values(): ArrayIterator<Node> {
    return this.nodes.values();
  }

  [Symbol.iterator](): ArrayIterator<Node> {
    return this.nodes.values();
  }

  // To make TypeScript happy with indexing
  [index: number]: Node;
}

/**
 * Factory for creating a ServerNodeList.
 */
export function createServerNodeList(nodes: ServerNode[]): NodeList {
  return new SSRNodeList(nodes) as unknown as NodeList;
}
