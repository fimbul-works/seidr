import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../../dom/internal";
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

  it("should mount a component with a single DOM element", () => {
    const Comp = component(() => $("div", { className: "single", textContent: "Single" }), "Single")();
    mountComponent(Comp, anchor);

    expect(container.innerHTML).toContain(`${SEIDR_COMPONENT_START_PREFIX}Single-`);
    expect(container.innerHTML).toContain('<div class="single" data-seidr-root="');
    expect(container.innerHTML).toContain('">Single</div>');
    expect(container.innerHTML).toContain(`${SEIDR_COMPONENT_END_PREFIX}Single-`);

    // Check order: Start Marker -> Element -> End Marker -> Anchor
    const nodes = Array.from(container.childNodes);
    expect(nodes[0].nodeType).toBe(Node.COMMENT_NODE); // Start
    expect(nodes[1].nodeType).toBe(Node.ELEMENT_NODE); // Div
    expect(nodes[2].nodeType).toBe(Node.COMMENT_NODE); // End
    expect(nodes[3]).toBe(anchor);
  });

  it("should mount a component with an array of DOM elements", () => {
    const Comp = component(
      () => [$("div", { className: "one", textContent: "One" }), $("div", { className: "two", textContent: "Two" })],
      "ArrayComp",
    )();

    mountComponent(Comp, anchor);

    expect(container.innerHTML).toContain('<div class="one" data-seidr-root="');
    expect(container.innerHTML).toContain('">One</div>');
    expect(container.innerHTML).toContain('<div class="two">Two</div>');

    const nodes = Array.from(container.childNodes);
    // Start -> Div1 -> Div2 -> End -> Anchor
    expect(nodes[1].textContent).toBe("One");
    expect(nodes[2].textContent).toBe("Two");
  });

  it("should recursively mount nested components", () => {
    const Child = component(() => $("span", { className: "child", textContent: "Child Component" }), "Child");
    const Parent = component(() => Child(), "Parent")();

    mountComponent(Parent, anchor);

    const html = container.innerHTML;
    expect(html).toContain(`${SEIDR_COMPONENT_START_PREFIX}Parent-`);
    expect(html).toContain(`${SEIDR_COMPONENT_START_PREFIX}Child-`);
    expect(html).toContain("Child Component");
    expect(html).toContain(`${SEIDR_COMPONENT_END_PREFIX}Child-`);
    expect(html).toContain(`${SEIDR_COMPONENT_END_PREFIX}Parent-`);

    // Verify nesting structure via markers
    // ParentStart -> ChildStart -> Span -> ChildEnd -> ParentEnd -> Anchor
    const nodes = Array.from(container.childNodes);
    expect(nodes[0].textContent).toContain("Parent");
    expect(nodes[1].textContent).toContain("Child");
    expect((nodes[2] as HTMLElement).className).toBe("child");
    expect(nodes[3].textContent).toContain("/Child");
    expect(nodes[4].textContent).toContain("/Parent");
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

    // ParentStart -> Div1 -> ChildStart -> Span -> ChildEnd -> Div2 -> ParentEnd -> Anchor
    const nodes = Array.from(container.childNodes);
    expect(nodes[1].textContent).toBe("Node 1");
    expect(nodes[2].textContent).toContain("Child"); // Start marker
    expect(nodes[3].textContent).toBe("Child"); // Span content
    expect(nodes[4].textContent).toContain("/Child"); // End marker
    expect(nodes[5].textContent).toBe("Node 2");
  });

  it("should handle deeply nested components", () => {
    const Level3 = component(() => $("div", { textContent: "L3" }), "L3");
    const Level2 = component(() => Level3(), "L2");
    const Level1 = component(() => Level2(), "L1")();

    mountComponent(Level1, anchor);

    expect(container.innerHTML).toContain("L3");
    // Check marker presence for all levels
    expect(container.innerHTML).toContain("L1");
    expect(container.innerHTML).toContain("L2");
    expect(container.innerHTML).toContain("L3");
  });
});
