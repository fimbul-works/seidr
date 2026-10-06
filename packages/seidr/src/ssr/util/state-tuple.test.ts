import { describe, expect, it } from "vitest";
import { packHydrationState, unpackHydrationState } from "./state-tuple.js";

describe("state-tuple (packHydrationState & unpackHydrationState)", () => {
  it("should pack and unpack primitive values", () => {
    const values = new Map<string, any>([
      ["num", 42],
      ["str", "hello"],
      ["bool", true],
      ["nullVal", null],
    ]);

    const payload = packHydrationState(values);
    expect(payload).toEqual([
      [42, "num"],
      ["hello", "str"],
      [true, "bool"],
      [null, "nullVal"],
    ]);

    const restored = unpackHydrationState(payload);
    expect(restored.get("num")).toBe(42);
    expect(restored.get("str")).toBe("hello");
    expect(restored.get("bool")).toBe(true);
    expect(restored.get("nullVal")).toBe(null);
  });

  it("should deduplicate identical primitive values across multiple Value IDs", () => {
    const values = new Map<string, any>([
      ["a", 100],
      ["b", 100],
      ["c", "shared"],
      ["d", "shared"],
    ]);

    const payload = packHydrationState(values);
    expect(payload).toEqual([
      [100, "a", "b"],
      ["shared", "c", "d"],
    ]);

    const restored = unpackHydrationState(payload);
    expect(restored.get("a")).toBe(100);
    expect(restored.get("b")).toBe(100);
    expect(restored.get("c")).toBe("shared");
    expect(restored.get("d")).toBe("shared");
  });

  it("should handle opaque objects", () => {
    const obj1 = { slug: "post-1", title: "Post 1" };
    const obj2 = { slug: "post-2", title: "Post 2" };
    const values = new Map<string, any>([
      ["p1", obj1],
      ["p2", obj2],
    ]);

    const payload = packHydrationState(values);
    expect(payload).toEqual([
      [obj1, "p1"],
      [obj2, "p2"],
    ]);

    const restored = unpackHydrationState(payload);
    expect(restored.get("p1")).toEqual(obj1);
    expect(restored.get("p2")).toEqual(obj2);
  });

  it("should deduplicate shared arrays across multiple Value IDs (Suspense pattern)", () => {
    const post1 = { slug: "hydration", title: "Hydration Magic" };
    const post2 = { slug: "routing", title: "Routing Capabilities" };
    const postsArray = [post1, post2];

    // Simulating: `posts` and Suspense's internal `value` (`Bj9xd-2`) sharing the same array
    const values = new Map<string, any>([
      ["posts", postsArray],
      ["Bj9xd-2", postsArray],
    ]);

    const payload = packHydrationState(values);

    // postsArray is at index 0, with child indices [1, 2], and value IDs "posts" and "Bj9xd-2"
    expect(payload).toEqual([[[1, 2], "posts", "Bj9xd-2"], [post1], [post2]]);

    const restored = unpackHydrationState(payload);
    const restoredPosts = restored.get("posts");
    const restoredSuspense = restored.get("Bj9xd-2");

    expect(restoredPosts).toEqual(postsArray);
    expect(restoredSuspense).toEqual(postsArray);
    // Crucial check: referential equality is preserved!
    expect(restoredPosts).toBe(restoredSuspense);
  });

  it("should encode array elements as indices into the unique values table", () => {
    const values = new Map<string, any>([["coords", [10, 20, 30]]]);

    const payload = packHydrationState(values);
    expect(payload).toEqual([[[1, 2, 3], "coords"], [10], [20], [30]]);

    const restored = unpackHydrationState(payload);
    expect(restored.get("coords")).toEqual([10, 20, 30]);
  });

  it("should deduplicate repeated scalars inside an array", () => {
    const values = new Map<string, any>([["zeros", [0, 0, 0, 0]]]);

    const payload = packHydrationState(values);
    // 0 is registered once at index 1; the array points to index 1 four times
    expect(payload).toEqual([[[1, 1, 1, 1], "zeros"], [0]]);

    const restored = unpackHydrationState(payload);
    expect(restored.get("zeros")).toEqual([0, 0, 0, 0]);
  });

  it("should handle nested multidimensional arrays", () => {
    const matrix = [
      [1, 2],
      [3, 4],
    ];
    const values = new Map<string, any>([["matrix", matrix]]);

    const payload = packHydrationState(values);
    const restored = unpackHydrationState(payload);

    expect(restored.get("matrix")).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("should handle empty arrays", () => {
    const empty: any[] = [];
    const values = new Map<string, any>([
      ["empty1", empty],
      ["empty2", empty],
      ["distinctEmpty", []],
    ]);

    const payload = packHydrationState(values);
    const restored = unpackHydrationState(payload);

    expect(restored.get("empty1")).toEqual([]);
    expect(restored.get("empty2")).toEqual([]);
    expect(restored.get("distinctEmpty")).toEqual([]);
    // empty1 and empty2 share the same instance
    expect(restored.get("empty1")).toBe(restored.get("empty2"));
  });

  it("should handle self-referencing circular arrays", () => {
    const cyclic: any[] = [];
    cyclic.push(cyclic);

    const values = new Map<string, any>([["cyclic", cyclic]]);

    const payload = packHydrationState(values);
    expect(payload).toEqual([[[0], "cyclic"]]);

    const restored = unpackHydrationState(payload);
    const restoredCyclic = restored.get("cyclic");

    expect(Array.isArray(restoredCyclic)).toBe(true);
    expect(restoredCyclic.length).toBe(1);
    expect(restoredCyclic[0]).toBe(restoredCyclic);
  });

  it("should handle mutual circular arrays", () => {
    const a: any[] = [];
    const b: any[] = [];
    a.push(b);
    b.push(a);

    const values = new Map<string, any>([
      ["a", a],
      ["b", b],
    ]);

    const payload = packHydrationState(values);
    const restored = unpackHydrationState(payload);

    const restoredA = restored.get("a");
    const restoredB = restored.get("b");

    expect(restoredA[0]).toBe(restoredB);
    expect(restoredB[0]).toBe(restoredA);
  });

  it("should safely handle invalid or empty payloads", () => {
    expect(unpackHydrationState([]).size).toBe(0);
    expect(unpackHydrationState(null as any).size).toBe(0);
    expect(unpackHydrationState(undefined as any).size).toBe(0);
  });
});
