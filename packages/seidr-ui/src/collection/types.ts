import type { Value } from "@fimbul-works/seidr";

export interface CollectionNode<T = any> {
  /** The type of item this node represents. */
  type: "item" | "section";

  /** A unique key for the node. */
  key: string;

  /** The source object this node was created from. */
  rawValue: T;

  /** A string value for the node, used for features like typeahead. */
  textValue: string;

  /** Whether the node is disabled. */
  disabled: boolean;

  /** The level of depth this node is at in the hierarchy. */
  level: number;

  /** The index of this node within its parent. */
  index: number;

  /** The key of the node before this node. */
  prevKey?: string;

  /** The key of the node after this node. */
  nextKey?: string;
}

export interface Collection<T = CollectionNode> extends Iterable<T> {
  /** The number of items in the collection. */
  getSize(): number;

  /** Iterate over all keys in the collection. */
  getKeys(): Iterable<string>;

  /** Get an item by its key. */
  getItem(key: string): T | undefined;

  /** Get an item by its index. */
  at(idx: number): T | undefined;

  /** Get the key that comes before the given key in the collection. */
  getKeyBefore(key: string): string | undefined;

  /** Get the key that comes after the given key in the collection. */
  getKeyAfter(key: string): string | undefined;

  /** Get the first key in the collection. */
  getFirstKey(): string | undefined;

  /** Get the last key in the collection. */
  getLastKey(): string | undefined;
}

export interface CollectionBase<T = any> {
  /** The source data to be managed by the collection. */
  dataSource: T[] | Value<T[]>;

  /** Property name or getter function to use as the key of an item. */
  getKey?: string | ((data: T) => string);

  /** Property name or getter function to use as the text value of an item for typeahead purpose. */
  getTextValue?: string | ((data: T) => string);

  /** Property name or getter function to use as the disabled flag of an item. */
  getDisabled?: string | ((data: T) => boolean);

  /** Property name or getter function that refers to the children items of a section. */
  getSectionChildren?: string | ((section: T) => any[]);
}
