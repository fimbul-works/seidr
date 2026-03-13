import { describe, expect, it } from "vitest";
import {
  SEIDR_COMPONENT_END_PREFIX,
  SEIDR_COMPONENT_START_PREFIX,
  TAG_COMPONET_PREFIX,
  TAG_TEXT,
} from "../../constants";
import { buildComponentDomTree } from "./build-component-dom-tree";
import type { ComponentTreeNode } from "./types";

describe("buildComponentDomTree", () => {
  it("Test 1: Simple linear mapping of DOM elements to ComponentTreeNodes", () => {
    // Physical DOM mock
    const physicalNodes = [
      document.createElement("div"), // index 0
      document.createElement("span"), // index 1
      document.createTextNode("text"), // index 2
    ];

    // Virtual ComponentTreeNodes (mocked reconstructComponentTree output)
    const componentNodes: ComponentTreeNode[] = [
      { tag: "div", creationIndex: 0 },
      { tag: "span", creationIndex: 1 },
      { tag: TAG_TEXT, creationIndex: 2 },
    ];

    const result = buildComponentDomTree(componentNodes, physicalNodes, "TestComponent-1");

    expect(result.tree.id).toBe("TestComponent-1");
    expect(result.consumedCount).toBe(3);

    // claimNodes should precisely map to the DOM Node instances via creationIndex linear sort
    expect(result.tree.claimNodes.length).toBe(3);
    expect(result.tree.claimNodes[0]).toBe(physicalNodes[0]);
    expect(result.tree.claimNodes[1]).toBe(physicalNodes[1]);
    expect(result.tree.claimNodes[2]).toBe(physicalNodes[2]);
  });

  it("Test 2: Linearization sorts by creationIndex for O(1) chronological evaluation", () => {
    // Top-down the ComponentTreeNode might have children nested,
    // but creationIndex specifies instantiation chronological order.

    // Parent DIV -> Child SPAN
    // In DOM: <div id="parent"><span id="child"></span></div>
    // creationIndex mapping:
    // 0: div (parent)
    // 1: span (child) -> created chronologically after parent div during factory setup!

    const div = document.createElement("div");
    const span = document.createElement("span");
    div.appendChild(span);

    // The physical nodes provided to root are only the top-level nodes of the component boundary
    const physicalNodes = [div];

    const componentNodes: ComponentTreeNode[] = [
      {
        tag: "div",
        creationIndex: 0,
        children: [{ tag: "span", creationIndex: 1 }],
      },
    ];

    const result = buildComponentDomTree(componentNodes, physicalNodes, "TestComponent-1");

    expect(result.consumedCount).toBe(1); // Consumed 1 top-level node (div)
    expect(result.tree.claimNodes.length).toBe(2);

    // Should be sorted by creationIndex securely!
    expect(result.tree.claimNodes[0]).toBe(div);
    expect(result.tree.claimNodes[1]).toBe(span);
  });

  it("Test 3: Properly skips marker comments and empty text nodes", () => {
    const physicalNodes = [
      document.createComment(`${SEIDR_COMPONENT_START_PREFIX}Component-2`), // Marker start
      document.createTextNode("  \n  "), // Empty formatting text node
      document.createElement("p"), // index 0 mapping
      document.createComment(`${SEIDR_COMPONENT_END_PREFIX}Component-2`), // Marker end
    ];

    const componentNodes: ComponentTreeNode[] = [{ tag: "p", creationIndex: 0 }];

    const result = buildComponentDomTree(componentNodes, physicalNodes, "TestComponent-1");

    expect(result.consumedCount).toBe(4); // Consumed all items including the fluff
    expect(result.tree.claimNodes.length).toBe(1);
    expect(result.tree.claimNodes[0]).toBe(physicalNodes[2]); // mapped past markers
  });

  it("Test 4: Merges and tracks nested child ComponentDomTrees", () => {
    // Nested component boundary inside parent
    const physicalNodes = [
      document.createElement("h1"), // index 0 (parent)
      document.createElement("p"), // Inner component DOM node (consumed by sub-tree)
      document.createElement("footer"), // index 1 (parent)
    ];

    const componentNodes: ComponentTreeNode[] = [
      { tag: "h1", creationIndex: 0 },
      {
        tag: `${TAG_COMPONET_PREFIX}ChildComponent-2`,
        id: "ChildComponent-2",
        creationIndex: 999, // Should be ignored as root boundaries claim over it
        children: [{ tag: "p", creationIndex: 0 }],
      },
      { tag: "footer", creationIndex: 1 },
    ];

    const result = buildComponentDomTree(componentNodes, physicalNodes, "ParentComponent-1");

    expect(result.consumedCount).toBe(3);

    // Parent claimNodes only contain its own mapped nodes
    expect(result.tree.claimNodes.length).toBe(2);
    expect(result.tree.claimNodes[0]).toBe(physicalNodes[0]);
    expect(result.tree.claimNodes[1]).toBe(physicalNodes[2]);

    // Nested tree mapped successfully
    expect(result.tree.children.has("ChildComponent-2")).toBe(true);
    const childTree = result.tree.children.get("ChildComponent-2")!;
    expect(childTree.id).toBe("ChildComponent-2");
    expect(childTree.claimNodes.length).toBe(1);
    expect(childTree.claimNodes[0]).toBe(physicalNodes[1]);
  });

  it("Test 5: Correctly handles text node merging (multi-virtual to single-physical)", () => {
    // SSR often merges adjacent text nodes into one physical node
    const physicalNodes = [document.createTextNode("AB")];

    const componentNodes: ComponentTreeNode[] = [
      { tag: TAG_TEXT, creationIndex: 0 },
      { tag: TAG_TEXT, creationIndex: 1 },
    ];

    const result = buildComponentDomTree(componentNodes, physicalNodes, "TestComponent-1");

    expect(result.consumedCount).toBe(1);
    expect(result.tree.claimNodes.length).toBe(2);
    // Both virtual nodes point to the same physical text node
    expect(result.tree.claimNodes[0]).toBe(physicalNodes[0]);
    expect(result.tree.claimNodes[1]).toBe(physicalNodes[0]);
  });

  it("Test 6: Handles empty components (nullish returns)", () => {
    const physicalNodes: ChildNode[] = [
      document.createComment(`${SEIDR_COMPONENT_START_PREFIX}Component-2`),
      document.createComment(`${SEIDR_COMPONENT_END_PREFIX}Component-2`),
    ];

    const componentNodes: ComponentTreeNode[] = [];

    const result = buildComponentDomTree(componentNodes, physicalNodes, "TestComponent-1");

    expect(result.consumedCount).toBe(2);
    expect(result.tree.claimNodes.length).toBe(0);
    expect(result.tree.children.size).toBe(0);
  });
});
