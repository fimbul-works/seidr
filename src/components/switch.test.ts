import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createComponent } from "../component";
import { mount } from "../dom";
import { $ } from "../element";
import { createValue } from "../observable";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { Switch } from "./switch";

describeDualMode("Switch Component", ({ getDocument }) => {
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

  it("should switch between branches based on value", () => {
    const state = createValue<"a" | "b" | "c">("a");

    const app = () =>
      $("div", { className: "container" }, [
        Switch(state, {
          a: () => $("span", { textContent: "Branch A" }),
          b: () => $("span", { textContent: "Branch B" }),
          c: () => $("span", { textContent: "Branch C" }),
        }),
      ]);

    unmount = mount(app, container);

    expect(container.textContent).toBe("Branch A");

    state("b");
    expect(container.textContent).toBe("Branch B");

    state("c");
    expect(container.textContent).toBe("Branch C");

    state("a");
    expect(container.textContent).toBe("Branch A");
  });

  it("should render fallback when no branch matches", () => {
    const state = createValue<string>("unknown");

    const app = () =>
      Switch(
        state,
        {
          home: () => $("h1", { textContent: "Home" }),
          about: () => $("h1", { textContent: "About" }),
        },
        () => $("h1", { textContent: "404 Not Found" }),
      );

    unmount = mount(app, container);

    expect(container.textContent).toBe("404 Not Found");

    state("home");
    expect(container.textContent).toBe("Home");

    state("missing");
    expect(container.textContent).toBe("404 Not Found");
  });

  it("should support Map branches", () => {
    const state = createValue<number>(1);
    const branches = new Map([
      [1, () => $("div", { textContent: "First" })],
      [2, () => $("div", { textContent: "Second" })],
    ]);

    unmount = mount(() => Switch(state, branches), container);

    expect(container.textContent).toBe("First");

    state(2);
    expect(container.textContent).toBe("Second");
  });

  it("should support reactive branches Map/Record", () => {
    const state = createValue("tab1");
    const branches = createValue<Record<string, () => Element>>({
      tab1: () => $("div", { textContent: "Tab 1 Initial" }),
    });

    unmount = mount(() => Switch(state, branches), container);
    expect(container.textContent).toBe("Tab 1 Initial");

    // Dynamically update branches
    branches({
      tab1: () => $("div", { textContent: "Tab 1 Updated" }),
      tab2: () => $("div", { textContent: "Tab 2 Dynamic" }),
    });

    expect(container.textContent).toBe("Tab 1 Updated");

    state("tab2");
    expect(container.textContent).toBe("Tab 2 Dynamic");
  });

  it("should unmount previous branch components when switching", () => {
    const state = createValue("compA");
    const unmountedA = vi.fn();
    const unmountedB = vi.fn();

    const CompA = createComponent(() => {
      const comp = createComponent(() => $("div", { textContent: "Component A" }))();
      comp.onUnmount(unmountedA);
      return comp;
    });

    const CompB = createComponent(() => {
      const comp = createComponent(() => $("div", { textContent: "Component B" }))();
      comp.onUnmount(unmountedB);
      return comp;
    });

    unmount = mount(
      () =>
        Switch(state, {
          compA: CompA,
          compB: CompB,
        }),
      container,
    );

    expect(container.textContent).toBe("Component A");
    expect(unmountedA).not.toHaveBeenCalled();

    state("compB");
    expect(container.textContent).toBe("Component B");
    expect(unmountedA).toHaveBeenCalled();
    expect(unmountedB).not.toHaveBeenCalled();
  });
});
