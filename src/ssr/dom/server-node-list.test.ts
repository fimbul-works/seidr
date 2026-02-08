import { describe, expect, test } from "vitest";
import { TYPE_TEXT_NODE } from "../../constants";
import { createServerNode } from "./server-node";
import { createServerNodeList } from "./server-node-list";

describe("ServerNodeList", () => {
  test("implements basic NodeList functionality", () => {
    const n1 = createServerNode(TYPE_TEXT_NODE);
    const n2 = createServerNode(TYPE_TEXT_NODE);
    const list = createServerNodeList([n1, n2]);

    expect(list.length).toBe(2);
    expect(list.item(0)).toBe(n1);
    expect(list.item(1)).toBe(n2);
    expect(list.item(2)).toBe(null);
  });

  test("supports index-based access via proxy", () => {
    const n1 = createServerNode(TYPE_TEXT_NODE);
    const list = createServerNodeList([n1]);
    expect(list[0]).toBe(n1);
    expect(list[1]).toBe(null);
  });

  test("supports forEach", () => {
    const n1 = createServerNode(TYPE_TEXT_NODE);
    const n2 = createServerNode(TYPE_TEXT_NODE);
    const list = createServerNodeList([n1, n2]);
    const result: any[] = [];
    list.forEach((n) => result.push(n));
    expect(result).toEqual([n1, n2]);
  });

  test("supports iteration", () => {
    const n1 = createServerNode(TYPE_TEXT_NODE);
    const n2 = createServerNode(TYPE_TEXT_NODE);
    const list = createServerNodeList([n1, n2]);
    const result: any[] = [];
    for (const n of list) {
      result.push(n);
    }
    expect(result).toEqual([n1, n2]);
  });

  test("supports entries, keys, values", () => {
    const n1 = createServerNode(TYPE_TEXT_NODE);
    const list = createServerNodeList([n1]);

    expect(Array.from(list.entries())).toEqual([[0, n1]]);
    expect(Array.from(list.keys())).toEqual([0]);
    expect(Array.from(list.values())).toEqual([n1]);
  });
});
