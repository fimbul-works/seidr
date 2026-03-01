import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { component, useScope } from "../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { mount } from "../dom";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { Switch } from "./switch";

describeDualMode("Switch Component", ({ getDocument }) => {
  let container: HTMLDivElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
  });

  it("should render nested components without markers when returning single HTMLElement", () => {
    const Child = component(() => $("span", { textContent: "Child" }), "Child");
    const Parent = component(() => $("div", {}, [Child()]), "Parent");

    unmount = mount(Parent, container);

    // Child should NOT have markers
    expect(container.innerHTML).not.toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Child-`);
    expect(container.innerHTML).not.toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Child-`);

    expect(container.children[0]?.tagName).toBe("DIV");
    expect(container.children[0]?.textContent).toBe("Child");
    expect(container.children[0]?.children[0]?.tagName).toBe("SPAN");
    expect(container.children[0]?.children[0]?.textContent).toBe("Child");
  });

  it("should switch between components", () => {
    const mode = new Seidr("A");
    const CompA = component(() => $("span", { textContent: "View A" }), "CompA");
    const CompB = component(() => $("span", { textContent: "View B" }), "CompB");

    const Parent = () => {
      return $("div", { className: "parent" }, [
        Switch(mode, {
          A: CompA,
          B: CompB,
        }),
      ]);
    };

    unmount = mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain("View A");
    // Switch returns a component, so it gets markers
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Switch-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Switch-`);

    mode.value = "B";
    expect(parentEl.innerHTML).toContain("View B");
    expect(parentEl.innerHTML).not.toContain("View A");

    mode.value = "C"; // No match
    expect(parentEl.innerHTML).not.toContain("View B");
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Switch-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Switch-`);
  });

  it("should call onMount when switching components", () => {
    const onMount = vi.fn();
    const mode = new Seidr("A");

    const CompA = () => {
      const scope = useScope();
      scope.onMount((parent) => onMount("A", parent));
      return $("span", { textContent: "View A" });
    };

    const CompB = () => {
      const scope = useScope();
      scope.onMount((parent) => onMount("B", parent));
      return $("span", { textContent: "View B" });
    };

    const Parent = () => {
      return $("div", { className: "parent" }, [
        Switch(mode, {
          A: CompA,
          B: CompB,
        }),
      ]);
    };

    unmount = mount(Parent, container);
    expect(onMount).toHaveBeenCalledWith("A", expect.anything());

    onMount.mockClear();
    mode.value = "B";
    expect(onMount).toHaveBeenCalledWith("B", expect.anything());
  });

  it("should destroy scope of previous component when switching", () => {
    const mode = new Seidr("A");
    let scopeADestroyed = false;
    let scopeBDestroyed = false;

    const CompA = () => {
      const scope = useScope();
      scope.onUnmount(() => (scopeADestroyed = true));
      return $("span", { textContent: "View A" });
    };

    const CompB = () => {
      const scope = useScope();
      scope.onUnmount(() => (scopeBDestroyed = true));
      return $("span", { textContent: "View B" });
    };

    unmount = mount(() => Switch(mode, { A: CompA, B: CompB }), container);

    mode.value = "B";
    expect(scopeADestroyed).toBe(true);
    expect(scopeBDestroyed).toBe(false);

    mode.value = "A";
    expect(scopeBDestroyed).toBe(true);
  });
});
