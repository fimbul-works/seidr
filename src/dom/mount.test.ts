import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../component";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { mount } from "./mount";

describeDualMode("mount", () => {
  let container: HTMLElement;
  let unmount: CleanupFunction;

  beforeEach(() => {
    container = $("div");
  });

  afterEach(() => {
    unmount();
  });

  it("should mount component into container", () => {
    const mockElement = $("div");
    const createComp = component(() => {
      return mockElement;
    });
    const comp = createComp();

    unmount = mount(comp, container);

    expect(container.contains(mockElement)).toBe(true);
  });

  it("should return unmount function", () => {
    const mockElement = $("div");
    const createComp = component(() => {
      return mockElement;
    });
    const comp = createComp();

    unmount = mount(comp, container);

    expect(typeof unmount).toBe("function");
    expect(container.contains(mockElement)).toBe(true);

    unmount();

    expect(container.contains(mockElement)).toBe(false);
  });

  it("should cleanup all reactive observers after unmount", () => {
    const text = new Seidr("test");
    const App = () => $("div", { textContent: text });

    expect(text.observerCount()).toBe(0);
    const unmount = mount(App, container);
    expect(text.observerCount()).toBe(1);

    unmount();
    expect(text.observerCount()).toBe(0);
  });

  describe("Failure Modes & Factory Variants", () => {
    it("should throw SeidrError when mounting to a null parent", () => {
      const App = () => $("div");
      // @ts-expect-error - Testing null parent
      expect(() => mount(App, null)).toThrow(/Cannot mount to null parent/);
    });

    it("should handle a plain factory function that returns an element", () => {
      const App = () => $("span", { textContent: "Plain Element" });
      unmount = mount(App, container);

      expect(container.innerHTML).toContain("Plain Element");
      expect(container.querySelector("span")).not.toBeNull();
    });

    it("should handle a pre-initialized component", () => {
      const Comp = component(() => $("p", { textContent: "Pre-init" }), "Comp");
      const instance = Comp();

      unmount = mount(instance, container);
      expect(container.textContent).toBe("Pre-init");
    });
  });
});
