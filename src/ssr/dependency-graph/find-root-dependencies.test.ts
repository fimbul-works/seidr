import { describe, expect, it } from "vitest";
import { findRootDependencies } from "./find-root-dependencies";
import type { DependencyGraph } from "./types";

describe("findRootDependencies", () => {
  it("should return single root for root observable", () => {
    const graph: DependencyGraph = {
      nodes: [{ id: 0, parents: [] }],
      rootIds: [0],
    };

    const roots = findRootDependencies(graph, 0);
    expect(roots).toEqual(new Set([0]));
  });

  it("should find root for single derivation", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] },
        { id: 1, parents: [0] },
      ],
      rootIds: [0],
    };

    const roots = findRootDependencies(graph, 1);
    expect(roots).toEqual(new Set([0]));
  });

  it("should find multiple roots for computed observable", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] },
        { id: 1, parents: [] },
        { id: 2, parents: [0, 1] },
      ],
      rootIds: [0, 1],
    };

    const roots = findRootDependencies(graph, 2);
    expect(roots).toEqual(new Set([0, 1]));
  });

  it("should handle multi-level dependencies", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] },
        { id: 1, parents: [0] },
        { id: 2, parents: [1] },
      ],
      rootIds: [0],
    };

    const roots = findRootDependencies(graph, 2);
    expect(roots).toEqual(new Set([0]));
  });

  it("should deduplicate shared roots", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] }, // shared root
        { id: 1, parents: [0] },
        { id: 2, parents: [0] },
        { id: 3, parents: [1, 2] }, // both depend on same root
      ],
      rootIds: [0],
    };

    const roots = findRootDependencies(graph, 3);
    expect(roots).toEqual(new Set([0])); // Only one root, deduplicated
  });
});
