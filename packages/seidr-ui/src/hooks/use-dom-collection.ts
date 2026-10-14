import {
  type CleanupFunction,
  type EffectDependency,
  isValue,
  type Ref,
  unwrapValue,
  useEffect,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";

export interface DomCollectionItem {
  /** The ref or element accessor for this item. */
  ref: Ref<HTMLElement> | Value<HTMLElement | null | undefined> | (() => HTMLElement | null | undefined);

  /** A unique key for the item. */
  key?: string;

  /** A text value for the item, used for typeahead. */
  textValue?: string;

  /** Whether the item is disabled. */
  disabled?: boolean;
}

export interface UseDomCollectionProps<T extends DomCollectionItem = DomCollectionItem> {
  /** Optional external reactive Value to bind items to. */
  items?: Value<T[]>;

  /** Event handler called when items collection changes. */
  onItemsChange?: (items: T[]) => void;
}

export interface DomCollection<T extends DomCollectionItem = DomCollectionItem> {
  /** The list of registered items, sorted in DOM position order. */
  items: Value<T[]>;

  /** Registers an item into the collection, returning an unregister function. */
  registerItem(item: T): CleanupFunction;

  /** Forces a DOM-order sort of the current items. */
  sort(): void;
}

export function getElementFromItem(item: DomCollectionItem): HTMLElement | null {
  return item.ref() ?? null;
}

function isElementPreceding(a: Element, b: Element): boolean {
  return Boolean(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING);
}

export function findDOMIndex<T extends DomCollectionItem>(items: T[], item: T): number {
  const itemEl = getElementFromItem(item);
  if (!itemEl) return -1;

  let length = items.length;
  if (!length) return -1;

  while (length--) {
    const currentItemEl = getElementFromItem(items[length]);
    if (!currentItemEl) continue;

    if (isElementPreceding(currentItemEl, itemEl)) {
      return length + 1;
    }
  }

  return 0;
}

export function sortBasedOnDOMPosition<T extends DomCollectionItem>(items: T[]): T[] {
  const pairs = items.map((item, index) => [index, item] as const);
  let isOrderDifferent = false;

  pairs.sort(([indexA, a], [indexB, b]) => {
    const elementA = getElementFromItem(a);
    const elementB = getElementFromItem(b);

    if (elementA === elementB) return 0;
    if (!elementA || !elementB) return 0;

    if (isElementPreceding(elementA, elementB)) {
      if (indexA > indexB) isOrderDifferent = true;
      return -1;
    }

    if (indexA < indexB) isOrderDifferent = true;
    return 1;
  });

  return isOrderDifferent ? pairs.map(([_, item]) => item) : items;
}

/**
 * Manages an ordered collection of DOM items, sorted according to document hierarchy.
 *
 * Ported from Kobalte's createDomCollection primitive.
 */
export function useDomCollection<T extends DomCollectionItem = DomCollectionItem>(
  props: UseDomCollectionProps<T> = {},
): DomCollection<T> {
  const items = wrapValue<T[]>(props.items ?? []);

  const sort = () => {
    const current = items();
    const sorted = sortBasedOnDOMPosition(current);
    if (sorted !== current) {
      items(sorted);
      props.onItemsChange?.(sorted);
    }
  };

  const registerItem = (item: T): CleanupFunction => {
    const current = items();
    const index = findDOMIndex(current, item);

    let next: T[];
    if (index === -1 || index >= current.length) {
      next = [...current, item];
    } else {
      next = [...current.slice(0, index), item, ...current.slice(index)];
    }

    items(next);
    props.onItemsChange?.(next);

    return () => {
      const prev = items();
      const filtered = prev.filter((i) => i !== item);
      if (filtered.length !== prev.length) {
        items(filtered);
        props.onItemsChange?.(filtered);
      }
    };
  };

  return {
    items,
    registerItem,
    sort,
  };
}

/**
 * Registers an item into a DomCollection, automatically unregistering on unmount.
 */
export function useDomCollectionItem<T extends DomCollectionItem = DomCollectionItem>(
  collection: DomCollection<T>,
  item: T,
  shouldRegister: boolean | Value<boolean> = true,
): void {
  const deps: EffectDependency[] = [shouldRegister].filter(isValue);

  useEffect(() => {
    if (!unwrapValue(shouldRegister)) return;

    return collection.registerItem(item);
  }, deps);
}
