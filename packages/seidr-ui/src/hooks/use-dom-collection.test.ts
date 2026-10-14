import { createComponent, createRef, mount } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { beforeEach, describe, expect, it } from "vitest";
import { useDomCollection, useDomCollectionItem } from "./use-dom-collection.js";

describe("useDomCollection", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = $div();
    document.body.appendChild(container);
  });

  it("registers items and sorts them according to DOM order", () => {
    const el1 = $div();
    const el2 = $div();
    const el3 = $div();

    container.appendChild(el1);
    container.appendChild(el2);
    container.appendChild(el3);

    const collection = useDomCollection();

    // Register out of DOM order: el2, then el1, then el3
    const unregister2 = collection.registerItem({ ref: () => el2, key: "2" });
    const unregister1 = collection.registerItem({ ref: () => el1, key: "1" });
    const unregister3 = collection.registerItem({ ref: () => el3, key: "3" });

    const items = collection.items();
    expect(items.map((i) => i.key)).toEqual(["1", "2", "3"]);

    unregister2();
    expect(collection.items().map((i) => i.key)).toEqual(["1", "3"]);

    unregister1();
    unregister3();
    expect(collection.items()).toEqual([]);
  });

  it("useDomCollectionItem automatically registers and unregisters with component lifecycle", () => {
    const collection = useDomCollection();

    const Comp = createComponent(() => {
      const ref = createRef<HTMLDivElement>();
      useDomCollectionItem(collection, { ref, key: "auto-item" });

      return $div({ ref }, "Item Content");
    });

    const unmount = mount(Comp, container);
    expect(collection.items().length).toBe(1);
    expect(collection.items()[0].key).toBe("auto-item");

    unmount();
    expect(collection.items().length).toBe(0);
  });
});
