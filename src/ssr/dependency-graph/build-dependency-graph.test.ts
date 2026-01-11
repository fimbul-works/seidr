import { describe, expect, it } from "vitest";
import { Seidr } from "../../core/index";
import { buildDependencyGraph } from "./build-dependency-graph";

describe("buildDependencyGraph", () => {
  it("should build graph from root observables only", () => {
    const seidr1 = new Seidr(42);
    const seidr2 = new Seidr("test");

    const entries = Array.from([
      [seidr1.id, seidr1],
      [seidr2.id, seidr2],
    ] as [number, Seidr<any>][]);

    const graph = buildDependencyGraph(entries);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.rootIds).toEqual([0, 1]);

    expect(graph.nodes[0]).toEqual({ id: 0 }); // root observable - parents omitted
    expect(graph.nodes[1]).toEqual({ id: 1 }); // root observable - parents omitted
  });

  it("should build graph with derived observables from .as()", () => {
    const parent = new Seidr(5);
    const derived = parent.as((x) => x * 2);

    const entries = Array.from([
      [parent.id, parent],
      [derived.id, derived],
    ] as [number, Seidr<any>][]);

    const graph = buildDependencyGraph(entries);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.rootIds).toEqual([0]);

    expect(graph.nodes[0]).toEqual({ id: 0 }); // parent (root) - parents omitted
    expect(graph.nodes[1]).toEqual({ id: 1, parents: [0] }); // derived (depends on parent)
  });

  it("should build graph with computed observables", () => {
    const firstName = new Seidr("John");
    const lastName = new Seidr("Doe");
    const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

    const entries = Array.from([
      [firstName.id, firstName],
      [lastName.id, lastName],
      [fullName.id, fullName],
    ] as [number, Seidr<any>][]);

    const graph = buildDependencyGraph(entries);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.rootIds).toEqual([0, 1]);

    expect(graph.nodes[0]).toEqual({ id: 0 }); // firstName - parents omitted
    expect(graph.nodes[1]).toEqual({ id: 1 }); // lastName - parents omitted
    expect(graph.nodes[2]).toEqual({ id: 2, parents: [0, 1] }); // fullName (depends on both)
  });

  it("should build graph with multi-level derivation", () => {
    const count = new Seidr(1);
    const doubled = count.as((x) => x * 2);
    const quadrupled = doubled.as((x) => x * 2);

    const entries = Array.from([
      [count.id, count],
      [doubled.id, doubled],
      [quadrupled.id, quadrupled],
    ] as [number, Seidr<any>][]);

    const graph = buildDependencyGraph(entries);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.rootIds).toEqual([0]);

    expect(graph.nodes[0]).toEqual({ id: 0 }); // count (root) - parents omitted
    expect(graph.nodes[1]).toEqual({ id: 1, parents: [0] }); // doubled (depends on count)
    expect(graph.nodes[2]).toEqual({ id: 2, parents: [1] }); // quadrupled (depends on doubled)
  });

  it("should build complex graph with multiple derivations from same root", () => {
    const base = new Seidr(10);
    const doubled = base.as((x) => x * 2);
    const tripled = base.as((x) => x * 3);
    const sum = Seidr.computed(() => doubled.value + tripled.value, [doubled, tripled]);

    const entries = Array.from([
      [base.id, base],
      [doubled.id, doubled],
      [tripled.id, tripled],
      [sum.id, sum],
    ] as [number, Seidr<any>][]);

    const graph = buildDependencyGraph(entries);

    expect(graph.nodes).toHaveLength(4);
    expect(graph.rootIds).toEqual([0]);

    expect(graph.nodes[0]).toEqual({ id: 0 }); // base (root) - parents omitted
    expect(graph.nodes[1]).toEqual({ id: 1, parents: [0] }); // doubled
    expect(graph.nodes[2]).toEqual({ id: 2, parents: [0] }); // tripled
    expect(graph.nodes[3]).toEqual({ id: 3, parents: [1, 2] }); // sum (depends on doubled and tripled)
  });

  it("should throw error when parent not in registered observables", () => {
    const parent = new Seidr(5);
    const derived = parent.as((x) => x * 2);

    // Only register derived, not parent (simulating SSR scope error)
    const entries = Array.from([[derived.id, derived]] as [number, Seidr<any>][]);

    expect(() => buildDependencyGraph(entries)).toThrow("Parent Seidr instance not found in registered observables");
  });

  it("should handle deterministic ID assignment based on entry order", () => {
    const seidr1 = new Seidr(1);
    const seidr2 = new Seidr(2);
    const seidr3 = new Seidr(3);

    // Test different orderings
    const entries1 = Array.from([
      [seidr1.id, seidr1],
      [seidr2.id, seidr2],
      [seidr3.id, seidr3],
    ] as [number, Seidr<any>][]);

    const entries2 = Array.from([
      [seidr3.id, seidr3],
      [seidr1.id, seidr1],
      [seidr2.id, seidr2],
    ] as [number, Seidr<any>][]);

    const graph1 = buildDependencyGraph(entries1);
    const graph2 = buildDependencyGraph(entries2);

    // IDs should be based on entry order
    expect(graph1.nodes[0].id).toBe(0); // seidr1
    expect(graph2.nodes[0].id).toBe(0); // seidr3 (different entry)
  });
});
