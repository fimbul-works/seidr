import { describe, expect, it } from "vitest";
import type { DependencyGraph } from "./types.js";
import { validateDependencyGraph } from "./validate-dependency-graph.js";

describe("validateDependencyGraph", () => {
  it("should validate correct graph", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] },
        { id: 1, parents: [0] },
      ],
      rootIds: [0],
    };

    const result = validateDependencyGraph(graph);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect missing parent IDs", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] },
        { id: 1, parents: [99] }, // parent 99 doesn't exist
      ],
      rootIds: [0],
    };

    const result = validateDependencyGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Node 1 has parent 99 that doesn't exist in the graph");
  });

  it("should detect circular dependencies", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [1] }, // 0 depends on 1
        { id: 1, parents: [0] }, // 1 depends on 0 (cycle!)
      ],
      rootIds: [],
    };

    const result = validateDependencyGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Circular dependency"))).toBe(true);
  });

  it("should detect root with parents", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [] },
        { id: 1, parents: [0] },
      ],
      rootIds: [0, 1], // 1 is marked as root but has parents
    };

    const result = validateDependencyGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Root ID 1 has parents, but should be a root observable");
  });

  it("should detect multiple errors", () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 0, parents: [99] }, // missing parent
        { id: 1, parents: [0] },
        { id: 2, parents: [3] }, // parent 3 doesn't exist
      ],
      rootIds: [0, 1], // invalid roots
    };

    const result = validateDependencyGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
