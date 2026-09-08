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
      const el = $("span", { textContent: "Visible" });
      const comp = createComponent(() => el)();
      comp.onUnmount(unmountedSpy);
      return comp;
    });

    unmount = mount(() => Show(isVisible, View), container);

    expect(container.textContent).toBe("Visible");
    expect(unmountedSpy).not.toHaveBeenCalled();

    isVisible(false);
    expect(container.textContent).toBe("");
    expect(unmountedSpy).toHaveBeenCalled();
  });
});
