/*
 * Portions of this file are based on code from Kobalte.
 * MIT License, Copyright 2024 jer3m01 jer3m01@jer3m01.com
 *
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/bfce84fee12a027d9cbc38b43e1747e3e4b4b169/packages/@react-stately/collections/src/useCollection.ts
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-collection/create-collection.ts
 */
import { createValue, isArray, isValue, onUnmounted, unwrapValue, type Value } from "@fimbul-works/seidr";
import type { Collection, CollectionBase, CollectionNode } from "./types.js";
import { buildNodes } from "./utils.js";

export interface CreateCollectionParams<T> extends CollectionBase<T> {
  /** The source data to be managed by the collection. */
  dataSource: T[] | Value<T[]>;

  /** Factory that creates the collection. */
  factory: (nodes: Iterable<CollectionNode<T>>) => Collection<CollectionNode<T>>;
}

/**
 * Creates a reactive `Value<Collection<CollectionNode<T>>>` managing an ordered collection of items.
 */
export function createCollection<T = any>(
  props: CreateCollectionParams<T>,
  deps: Value[] = [],
): Value<Collection<CollectionNode<T>>> {
  const build = (data: T[]): Collection<CollectionNode<T>> =>
    props.factory(
      buildNodes({
        ...props,
        dataSource: isArray(data) ? data : [],
      }),
    );

  const collection = createValue<Collection<CollectionNode<T>>>(build(unwrapValue(props.dataSource)), {
    parents: deps,
  });

  if (isValue<T[]>(props.dataSource)) {
    onUnmounted(props.dataSource.watch((data) => collection(build(data))));
  }

  return collection;
}
