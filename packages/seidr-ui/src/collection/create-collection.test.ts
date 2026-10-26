import { createValue } from "@fimbul-works/seidr";
import { describe, expect, it } from "vitest";
import { createCollection } from "./create-collection.js";
import { ItemCollection } from "./item-collection.js";

describe("createCollection", () => {
  it("builds collection from plain array of strings", () => {
    const collection = createCollection({
      dataSource: ["Apple", "Banana", "Cherry"],
      factory: (nodes) => new ItemCollection(nodes),
    });

    const col = collection();
    expect(col.getSize()).toBe(3);
    expect(col.getFirstKey()).toBe("Apple");
    expect(col.getLastKey()).toBe("Cherry");
    expect(col.getKeyAfter("Apple")).toBe("Banana");
    expect(col.getKeyBefore("Cherry")).toBe("Banana");
    expect(col.getItem("Banana")?.index).toBe(1);
    expect(col.at(0)?.key).toBe("Apple");
  });

  it("builds collection from object array with custom getKey and getDisabled", () => {
    const data = [
      { id: "1", label: "First", disabled: false },
      { id: "2", label: "Second", disabled: true },
    ];

    const collection = createCollection({
      dataSource: data,
      factory: (nodes) => new ItemCollection(nodes),
      getKey: "id",
      getTextValue: "label",
      getDisabled: "disabled",
    });

    const col = collection();
    expect(col.getSize()).toBe(2);
    expect(col.getItem("1")?.textValue).toBe("First");
    expect(col.getItem("2")?.disabled).toBe(true);
  });

  it("updates reactively when dataSource Value changes", () => {
    const data = createValue(["A", "B"]);
    const collection = createCollection({ dataSource: data, factory: (nodes) => new ItemCollection(nodes) });

    expect(collection().getSize()).toBe(2);
    expect(collection().getLastKey()).toBe("B");

    data(["A", "B", "C"]);
    expect(collection().getSize()).toBe(3);
    expect(collection().getLastKey()).toBe("C");
    expect(collection().getKeyAfter("B")).toBe("C");
  });

  it("handles sections and nested child items", () => {
    const data = [
      {
        name: "Fruits",
        items: [
          { id: "apple", label: "Apple" },
          { id: "banana", label: "Banana" },
        ],
      },
      {
        name: "Vegetables",
        items: [{ id: "carrot", label: "Carrot" }],
      },
    ];

    const collection = createCollection({
      dataSource: data,
      factory: (nodes) => new ItemCollection(nodes),
      getKey: "id",
      getTextValue: "label",
      getSectionChildren: "items",
    });

    const col = collection();
    // Only items count towards item size
    expect(col.getSize()).toBe(3);
    expect(col.getItem("apple")?.level).toBe(1);
    expect(col.getKeyAfter("apple")).toBe("banana");
    expect(col.getKeyAfter("banana")).toBe("carrot");
  });
});
