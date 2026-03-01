import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../../constants";
import { $ } from "../../element/create-element";
import { mountComponent } from "./mount-component";

describe("mountComponent", () => {
  let container: HTMLDivElement;
  let anchor: Comment;

  beforeEach(() => {
    container = document.createElement("div");
    anchor = document.createComment("anchor");
    container.appendChild(anchor);
  });

  afterEach(() => {
    container.innerHTML = "";
  });

  it("should mount a component with a single DOM element (no markers)", () => {
    const Comp = component(() => $("div", { className: "single", textContent: "Single" }), "Single")();
    mountComponent(Comp, anchor);

    expect(container.innerHTML).not.toContain(`${SEIDR_COMPONENT_START_PREFIX}Single-`);
    expect(container.innerHTML).not.toContain(`${SEIDR_COMPONENT_END_PREFIX}Single-`);

    const div = container.children.item(0);
    expect(div?.getAttribute("data-seidr-root")).toBe("0");
    expect(div?.className).toBe("single");
    expect(div?.textContent).toBe("Single");

    // Check order: Element -> Anchor
    const nodes = Array.from(container.childNodes);
    expect(nodes[0].nodeType).toBe(Node.ELEMENT_NODE); // Div
    expect(nodes[1]).toBe(anchor);
  });

  it("should mount a component with an array of DOM elements (with markers)", () => {
    const Comp = component(
      () => [$("div", { className: "one", textContent: "One" }), $("div", { className: "two", textContent: "Two" })],
      "ArrayComp",
    )();

    mountComponent(Comp, anchor);

    expect(container.innerHTML).toContain(`${SEIDR_COMPONENT_START_PREFIX}ArrayComp-`);
    expect(container.innerHTML).toContain(`${SEIDR_COMPONENT_END_PREFIX}ArrayComp-`);

    const one = container.children.item(0);
    expect(one?.getAttribute("data-seidr-root")).toBe("0");
    expect(one?.className).toBe("one");
    expect(one?.textContent).toBe("One");

    const two = container.children.item(1);
    expect(two?.className).toBe("two");
    expect(two?.textContent).toBe("Two");

    const nodes = Array.from(container.childNodes);
    // Start -> Div1 -> Div2 -> End -> Anchor
    expect(nodes[1].textContent).toBe("One");
    expect(nodes[2].textContent).toBe("Two");
  });

  it("should recursively mount nested components without markers if they return singular children", () => {
    const Child = component(() => $("span", { className: "child", textContent: "Child Component" }), "Child");
    const Parent = component(() => Child(), "Parent")();

    mountComponent(Parent, anchor);

    const html = container.innerHTML;
    // Both Parent and Child should NOT have markers
    expect(html).not.toContain("<!--Parent-");
    expect(html).not.toContain("<!--Child-");
    expect(html).toContain("Child Component");

    // Verify nesting structure:
    // Span -> Anchor
    const nodes = Array.from(container.childNodes);
    expect((nodes[0] as HTMLElement).className).toBe("child");
    expect(nodes[1]).toBe(anchor);
  });

  it("should handle mixed content (DOM nodes and Components)", () => {
    const Child = component(() => $("span", { textContent: "Child" }), "Child");
    const Mixed = component(
      () => [$("div", { textContent: "Node 1" }), Child(), $("div", { textContent: "Node 2" })],
      "Mixed",
    )();

    mountComponent(Mixed, anchor);

    const html = container.innerHTML;
    expect(html).toContain("Node 1");
    expect(html).toContain("Child");
    expect(html).toContain("Node 2");

    // MixedStart -> Div1 -> Span (Child) -> Div2 -> MixedEnd -> Anchor
    const nodes = Array.from(container.childNodes);
    expect(nodes[1].textContent).toBe("Node 1");
    expect(nodes[2].textContent).toBe("Child"); // Span content (no Child markers)
    expect(nodes[3].textContent).toBe("Node 2");
    expect(nodes[4].textContent).toContain("/Mixed");
  });

  it("should handle deeply nested components and omit markers for all singular returns", () => {
    const Level3 = component(() => $("div", { textContent: "L3" }), "L3");
    const Level2 = component(() => Level3(), "L2");
    const Level1 = component(() => Level2(), "L1")();

    mountComponent(Level1, anchor);

    expect(container.innerHTML).toContain("L3");
    // None should have markers as they all return a single thing.
    expect(container.innerHTML).not.toContain("<!--L1-");
    expect(container.innerHTML).not.toContain("<!--L2-");
    expect(container.innerHTML).not.toContain("<!--L3-");
  });
});
