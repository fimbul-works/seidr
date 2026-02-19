import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useScope } from "../component";
import { mount, SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../dom/internal";
import { $ } from "../element";
import { flushSync, Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { Conditional } from "./conditional";

describeDualMode("Conditional Component", ({ getDOMFactory }) => {
  let container: HTMLDivElement;
  let unmount: CleanupFunction;

  beforeEach(() => {
    const doc = getDOMFactory().getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
  });

  it("should render and toggle component based on condition", () => {
    const isVisible = new Seidr(false);
    const View = () => $("span", { textContent: "Visible" });

    const Parent = () => $("div", { className: "parent" }, [Conditional(isVisible, View)]);

    unmount = mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Conditional-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Conditional-`);
    expect(parentEl.innerHTML).not.toContain("Visible");

    isVisible.value = true;
    flushSync();
    expect(parentEl.innerHTML).toContain("Visible");

    isVisible.value = false;
    flushSync();
    expect(parentEl.innerHTML).not.toContain("Visible");
  });

  it("should call onAttached when component is shown", () => {
    const onAttached = vi.fn();
    const isVisible = new Seidr(false);

    const View = () => {
      const scope = useScope();
      scope.onAttached = (parent) => onAttached(parent);
      return $("span", { textContent: "Visible" });
    };

    const Parent = () => {
      return $("div", { className: "parent" }, [Conditional(isVisible, View)]);
    };

    unmount = mount(Parent, container);

    isVisible.value = true;
    flushSync();
    expect(onAttached).toHaveBeenCalledWith(expect.anything());
  });

  it("should destroy scope when condition becomes false", () => {
    const isVisible = new Seidr(true);
    let scopeDestroyed = false;

    const View = () => {
      const scope = useScope();
      scope.track(() => (scopeDestroyed = true));
      return $("span", { textContent: "Visible" });
    };

    unmount = mount(() => Conditional(isVisible, View), container);

    isVisible.value = false;
    flushSync();

    expect(scopeDestroyed).toBe(true);
  });
});
