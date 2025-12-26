import { describe, expect, it } from "vitest";
import { findPathsToRoots } from "./find-paths-to-roots";
import type { DependencyGraph } from "./types";

describe("findPathsToRoots", () => {
  it("should return empty path for root observable", () => {
    const graph: DependencyGraph = {
      nodes: [{ id: 0, parents: [] }],
      rootIds: [0],
    };

    const paths = findPathsToRoots(graph, 0);
    expect(paths).toEqual([[]]); // Empty path means it's already a root
  });

  it("should find single parent path", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] }, // root
        { id: 1, parents: [0] }, // child
      ],
      rootIds: [0],
    };

    const paths = findPathsToRoots(graph, 1);
    expect(paths).toEqual([[0]]); // node.parents[0]
  });

  it("should find multi-level path", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] }, // root
        { id: 1, parents: [0] }, // level 1
        { id: 2, parents: [1] }, // level 2
      ],
      rootIds: [0],
    };

    const paths = findPathsToRoots(graph, 2);
    expect(paths).toEqual([[0, 0]]); // node.parents[0].parents[0]
  });

  it("should find multiple paths for computed observable", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] }, // root1
        { id: 1, parents: [] }, // root2
        { id: 2, parents: [0, 1] }, // computed (depends on both)
      ],
      rootIds: [0, 1],
    };

    const paths = findPathsToRoots(graph, 2);
    expect(paths).toEqual([
      [0], // node.parents[0]
      [1], // node.parents[1]
    ]);
  });

  it("should find paths in complex diamond dependency", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] }, // root
        { id: 1, parents: [0] }, // a
        { id: 2, parents: [0] }, // b
        { id: 3, parents: [1, 2] }, // ab (diamond)
      ],
      rootIds: [0],
    };

    const paths = findPathsToRoots(graph, 3);
    expect(paths).toEqual([
      [0, 0], // node.parents[0].parents[0] (through a)
      [1, 0], // node.parents[1].parents[0] (through b)
    ]);
  });
});
