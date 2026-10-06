import { describe, expect, test } from "vitest";
import { SSRDocument, SSRNodeList, SSRTextNode } from "./index";

describe("ServerNodeList", () => {
  const doc = new SSRDocument();
  test("implements basic NodeList functionality", () => {
    const n1 = new SSRTextNode("hello", doc);
    const n2 = new SSRTextNode("world", doc);
    const list = new SSRNodeList([n1, n2]);

    expect(list.length).toBe(2);
    expect(list.item(0)).toBe(n1);
    expect(list.item(1)).toBe(n2);
    expect(list.item(2)).toBe(null);
  });

  test("supports index-based access via proxy", () => {
    const n1 = new SSRTextNode("hello", doc);
    const list = new SSRNodeList([n1]);
    expect(list[0]).toBe(n1);
    expect(list[1]).toBe(null);
  });

  test("supports forEach", () => {
    const n1 = new SSRTextNode("hello", doc);
    const n2 = new SSRTextNode("world", doc);
    const list = new SSRNodeList([n1, n2]);
    const result: any[] = [];
    list.forEach((n) => result.push(n));
    expect(result).toEqual([n1, n2]);
  });

  test("supports iteration", () => {
    const n1 = new SSRTextNode("hello", doc);
    const n2 = new SSRTextNode("world", doc);
    const list = new SSRNodeList([n1, n2]);
    const result: any[] = [];
    for (const n of list) {
      result.push(n);
    }
    expect(result).toEqual([n1, n2]);
  });

  test("supports entries, keys, values", () => {
    const n1 = new SSRTextNode("hello", doc);
    const list = new SSRNodeList([n1]);

    expect(Array.from(list.entries())).toEqual([[0, n1]]);
    expect(Array.from(list.keys())).toEqual([0]);
    expect(Array.from(list.values())).toEqual([n1]);
  });
});
