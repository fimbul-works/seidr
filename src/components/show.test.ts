import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createComponent } from "../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { mount } from "../dom";
import { $ } from "../element";
import { createValue } from "../observable";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { Show } from "./show";

describeDualMode("Show Component", ({ getDocument }) => {
  let container: HTMLDivElement;
  let unmount: CleanupFunction;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
    container?.remove();
  });

  it("should render and toggle component based on boolean condition", () => {
    const isVisible = createValue(false);
    const View = () => $("span", { textContent: "Visible" });

    const Parent = () => $("div", { className: "parent" }, [Show(isVisible, View)]);

    unmount = mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}`);
    expect(parentEl.textContent).not.toContain("Visible");

    isVisible(true);
    expect(parentEl.textContent).toContain("Visible");

    isVisible(false);
    expect(parentEl.textContent).not.toContain("Visible");
  });

  it("should render fallback factory when condition is false", () => {
    const isVisible = createValue(false);
    const View = () => $("span", { textContent: "Main Content" });
    const Fallback = () => $("span", { textContent: "Fallback Content" });

    unmount = mount(() => Show(isVisible, View, Fallback), container);

    expect(container.textContent).toBe("Fallback Content");

    isVisible(true);
    expect(container.textContent).toBe("Main Content");

    isVisible(false);
    expect(container.textContent).toBe("Fallback Content");
  });

  it("should properly unmount child component when condition becomes false", () => {
    const isVisible = createValue(true);
    const unmountedSpy = vi.fn();

    const View = createComponent(() => {
      const comp = createComponent(() => $("span", { textContent: "Visible" }))();
      comp.onUnmounted(unmountedSpy);
      return comp;
    });

    unmount = mount(() => Show(isVisible, View), container);

    expect(container.textContent).toBe("Visible");
    expect(unmountedSpy).not.toHaveBeenCalled();

    isVisible(false);
    expect(container.textContent).toBe("");
    expect(unmountedSpy).toHaveBeenCalled();
  });

  it("should render and toggle a component returning an array of nodes (multi-root / fragment)", () => {
    const isVisible = createValue(false);
    const MultiNodeView = createComponent(
      () => [
        $("span", { textContent: "First" }),
        $("span", { textContent: "Second" }),
        $("span", { textContent: "Third" }),
      ],
      "MultiNodeView",
    );

    const Parent = () => $("div", { className: "parent" }, [Show(isVisible, MultiNodeView)]);

    unmount = mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.textContent).not.toContain("First");
    expect(parentEl.textContent).not.toContain("Second");
    expect(parentEl.textContent).not.toContain("Third");
    expect(parentEl.querySelectorAll("span").length).toBe(0);

    isVisible(true);
    expect(parentEl.textContent).toContain("First");
    expect(parentEl.textContent).toContain("Second");
    expect(parentEl.textContent).toContain("Third");
    const spans = parentEl.querySelectorAll("span");
    expect(spans.length).toBe(3);
    expect(spans[0].textContent).toBe("First");
    expect(spans[1].textContent).toBe("Second");
    expect(spans[2].textContent).toBe("Third");
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}MultiNodeView-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}MultiNodeView-`);

    isVisible(false);
    expect(parentEl.textContent).not.toContain("First");
    expect(parentEl.textContent).not.toContain("Second");
    expect(parentEl.textContent).not.toContain("Third");
    expect(parentEl.querySelectorAll("span").length).toBe(0);

    // Toggle back to true to verify it can re-render cleanly
    isVisible(true);
    expect(parentEl.querySelectorAll("span").length).toBe(3);
    expect(parentEl.textContent).toBe("FirstSecondThird");
  });

  it("should render and toggle between a multi-node component and a multi-node fallback", () => {
    const isVisible = createValue(false);
    const MultiNodeView = createComponent(
      () => [
        $("span", { className: "view-node", textContent: "View 1" }),
        $("span", { className: "view-node", textContent: "View 2" }),
      ],
      "MultiNodeView",
    );
    const MultiNodeFallback = createComponent(
      () => [
        $("span", { className: "fallback-node", textContent: "Fallback 1" }),
        $("span", { className: "fallback-node", textContent: "Fallback 2" }),
      ],
      "MultiNodeFallback",
    );

    unmount = mount(() => Show(isVisible, MultiNodeView, MultiNodeFallback), container);

    expect(container.querySelectorAll(".fallback-node").length).toBe(2);
    expect(container.querySelectorAll(".view-node").length).toBe(0);
    expect(container.textContent).toBe("Fallback 1Fallback 2");
    expect(container.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}MultiNodeFallback-`);
    expect(container.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}MultiNodeFallback-`);

    isVisible(true);
    expect(container.querySelectorAll(".fallback-node").length).toBe(0);
    expect(container.querySelectorAll(".view-node").length).toBe(2);
    expect(container.textContent).toBe("View 1View 2");
    expect(container.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}MultiNodeView-`);
    expect(container.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}MultiNodeView-`);

    isVisible(false);
    expect(container.querySelectorAll(".fallback-node").length).toBe(2);
    expect(container.querySelectorAll(".view-node").length).toBe(0);
    expect(container.textContent).toBe("Fallback 1Fallback 2");
  });

  it("should properly unmount multi-root component and trigger lifecycle hooks when condition becomes false", () => {
    const isVisible = createValue(true);
    const unmountedSpy = vi.fn();

    const MultiNodeView = createComponent(() => {
      const comp = createComponent(
        () => [$("span", { textContent: "Node 1" }), $("span", { textContent: "Node 2" })],
        "InnerMulti",
      )();
      comp.onUnmounted(unmountedSpy);
      return comp;
    }, "MultiNodeView");

    unmount = mount(() => Show(isVisible, MultiNodeView), container);

    expect(container.querySelectorAll("span").length).toBe(2);
    expect(container.textContent).toBe("Node 1Node 2");
    expect(unmountedSpy).not.toHaveBeenCalled();

    isVisible(false);
    expect(container.textContent).toBe("");
    expect(container.querySelectorAll("span").length).toBe(0);
    expect(unmountedSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle plain factory functions returning an array of DOM nodes", () => {
    const isVisible = createValue(false);
    const PlainFragmentView = () => [
      $("p", { textContent: "Paragraph 1" }),
      $("p", { textContent: "Paragraph 2" }),
      $("p", { textContent: "Paragraph 3" }),
    ];

    unmount = mount(() => Show(isVisible, PlainFragmentView), container);

    expect(container.querySelectorAll("p").length).toBe(0);
    expect(container.textContent).toBe("");

    isVisible(true);
    expect(container.querySelectorAll("p").length).toBe(3);
    expect(container.textContent).toBe("Paragraph 1Paragraph 2Paragraph 3");

    isVisible(false);
    expect(container.querySelectorAll("p").length).toBe(0);
    expect(container.textContent).toBe("");
  });

  it("should clean up all nodes of a multi-root component when parent is unmounted", () => {
    const isVisible = createValue(true);
    const unmountedSpy = vi.fn();

    const MultiNodeView = createComponent(() => {
      const comp = createComponent(
        () => [$("span", { textContent: "Fragment A" }), $("span", { textContent: "Fragment B" })],
        "InnerMulti",
      )();
      comp.onUnmounted(unmountedSpy);
      return comp;
    }, "MultiNodeView");

    unmount = mount(() => Show(isVisible, MultiNodeView), container);

    expect(container.querySelectorAll("span").length).toBe(2);
    expect(unmountedSpy).not.toHaveBeenCalled();

    unmount();
    expect(container.querySelectorAll("span").length).toBe(0);
    expect(unmountedSpy).toHaveBeenCalledTimes(1);
  });
});
