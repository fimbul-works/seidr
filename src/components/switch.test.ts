import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { component, useScope } from "../component/internal";
import { mount, SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../dom/internal";
import { $ } from "../element";
import { flushSync, Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { Switch } from "./switch";

describeDualMode("Switch Component", ({ getDOMFactory }) => {
  let container: HTMLDivElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDOMFactory().getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
  });

  it("should render nested components with markers", () => {
    const Child = component(() => $("span", { textContent: "Child" }), "Child");
    const Parent = component(() => $("div", {}, [Child()]), "Parent");

    unmount = mount(Parent, container);

    expect(container.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Child-`);
    expect(container.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Child-`);
    expect(container.innerHTML).toContain("<span>Child</span>");
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
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Switch-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Switch-`);

    mode.value = "B";
    flushSync();
    expect(parentEl.innerHTML).toContain("View B");
    expect(parentEl.innerHTML).not.toContain("View A");

    mode.value = "C"; // No match
    flushSync();
    expect(parentEl.innerHTML).not.toContain("View B");
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Switch-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Switch-`);
  });

  it("should call onAttached when switching components", () => {
    const onAttached = vi.fn();
    const mode = new Seidr("A");

    const CompA = () => {
      const scope = useScope();
      scope.onAttached = (parent) => onAttached("A", parent);
      return $("span", { textContent: "View A" });
    };

    const CompB = () => {
      const scope = useScope();
      scope.onAttached = (parent) => onAttached("B", parent);
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
    expect(onAttached).toHaveBeenCalledWith("A", expect.anything());

    onAttached.mockClear();
    mode.value = "B";
    flushSync();
    expect(onAttached).toHaveBeenCalledWith("B", expect.anything());
  });

  it("should destroy scope of previous component when switching", () => {
    const mode = new Seidr("A");
    let scopeADestroyed = false;
    let scopeBDestroyed = false;

    const CompA = () => {
      const scope = useScope();
      scope.track(() => (scopeADestroyed = true));
      return $("span", { textContent: "View A" });
    };

    const CompB = () => {
      const scope = useScope();
      scope.track(() => (scopeBDestroyed = true));
      return $("span", { textContent: "View B" });
    };

    unmount = mount(() => Switch(mode, { A: CompA, B: CompB }), container);

    mode.value = "B";
    flushSync();
    expect(scopeADestroyed).toBe(true);
    expect(scopeBDestroyed).toBe(false);

    mode.value = "A";
    flushSync();
    expect(scopeBDestroyed).toBe(true);
  });
});
