import type { Collection, CollectionNode } from "./types.js";

/**
 * Basic implementation of a Collection that only contains items.
 */
export class ItemCollection<T = any> implements Collection<CollectionNode<T>> {
  private keyMap = new Map<string, CollectionNode<T>>();
  private itemsList: CollectionNode<T>[] = [];
  private itemKeys: string[] = [];

  constructor(nodes: Iterable<CollectionNode<T>>) {
    this.itemsList = Array.from(nodes);

    let prevItemNode!: CollectionNode<T>;

    for (const node of nodes) {
      if (node.type === "item") {
        this.keyMap.set(node.key, node);
        this.itemKeys.push(node.key);

        if (prevItemNode) {
          prevItemNode.nextKey = node.key;
          node.prevKey = prevItemNode.key;
        }

        prevItemNode = node;
      }
    }
  }

  getSize(): number {
    return this.itemKeys.length;
  }

  getKeys(): Iterable<string> {
    return this.itemKeys;
  }

  getItem(key: string): CollectionNode<T> | undefined {
    return this.keyMap.get(key);
  }

  at(idx: number): CollectionNode<T> | undefined {
    const key = this.itemKeys[idx];
    return key !== undefined ? this.keyMap.get(key) : undefined;
  }

  getKeyBefore(key: string): string | undefined {
    return this.keyMap.get(key)?.prevKey;
  }

  getKeyAfter(key: string): string | undefined {
    return this.keyMap.get(key)?.nextKey;
  }

  getFirstKey(): string | undefined {
    return this.itemKeys[0];
  }

  getLastKey(): string | undefined {
    return this.itemKeys[this.itemKeys.length - 1];
  }

  [Symbol.iterator](): Iterator<CollectionNode<T>> {
    return this.itemsList[Symbol.iterator]();
  }
}
