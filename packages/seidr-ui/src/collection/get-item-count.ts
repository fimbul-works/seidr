/*
 * Portions of this file are based on code from Kobalte.
 * MIT License, Copyright 2024 jer3m01 jer3m01@jer3m01.com
 *
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/22cb32d329e66c60f55d4fc4025d1d44bb015d71/packages/@react-stately/collections/src/getItemCount.ts
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-collection/get-item-count.ts
 */
import { isNum } from "@fimbul-works/seidr";
import type { CollectionNode } from "./types";

const cache = new WeakMap<Iterable<unknown>, number>();

/**
 * Counts the number of items in a collection.
 * @param collection The collection to count items in.
 * @returns The number of items in the collection.
 */
export function getItemCount(collection: Iterable<CollectionNode>): number {
  let count = cache.get(collection);
  if (isNum(count)) {
    return count;
  }

  count = 0;
  for (const item of collection) {
    if (item.type === "item") {
      count++;
    }
  }

  cache.set(collection, count);
  return count;
}
