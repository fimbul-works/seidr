import type { ServerNode } from "./types";

/**
 * Live collection of nodes for SSR.
 * Implements the NodeList interface by wrapping an internal array.
 */
export class ServerNodeList implements NodeList {
  private _nodes: Node[];

  constructor(nodes: ServerNode[]) {
    this._nodes = nodes as unknown as Node[];
    // biome-ignore lint/correctness/noConstructorReturn: Proxy for index-based access: list[0]
    return new Proxy(this, {
      get(target, prop) {
        if (typeof prop === "string" && !Number.isNaN(Number(prop))) {
          return target._nodes[Number(prop)] || null;
        }
        return (target as any)[prop];
      },
    });
  }

  get length(): number {
    return this._nodes.length;
  }

  item(index: number): Node | null {
    return this._nodes[index] || null;
  }

  forEach(callbackfn: (value: Node, key: number, parent: NodeList) => void, thisArg?: any): void {
    this._nodes.forEach((node, index) => {
      callbackfn.call(thisArg, node, index, this as unknown as NodeList);
    });
  }

  entries(): ArrayIterator<[number, Node]> {
    return this._nodes.map((n, i) => [i, n] as [number, Node]).values();
  }

  keys(): ArrayIterator<number> {
    return this._nodes.keys();
  }

  values(): ArrayIterator<Node> {
    return this._nodes.values();
  }

  [Symbol.iterator](): ArrayIterator<Node> {
    return this._nodes.values();
  }

  // To make TypeScript happy with indexing
  [index: number]: Node;
}

/**
 * Factory for creating a ServerNodeList.
 */
export function createServerNodeList(nodes: ServerNode[]): NodeList {
  return new ServerNodeList(nodes) as unknown as NodeList;
}
