import { beforeEach, describe, expect, it, vi } from "vitest";
import { component, useScope } from "../component";
import { $, type SeidrElement } from "../element";
import { Seidr } from "../seidr";
import { mountSwitch } from "./mount-switch";

describe("mountSwitch", () => {
  let container: SeidrElement;

  beforeEach(() => {
    container = $("div");
  });

  it("should render component based on initial value", () => {
    const mode = new Seidr<"list" | "grid">("list");
    const listElement = $("div");
    const gridElement = $("div");

    mountSwitch(
      mode,
      {
        list: () => listElement,
        grid: () => gridElement,
      },
      container,
    );

    expect(container.contains(listElement)).toBe(true);
    expect(container.contains(gridElement)).toBe(false);
  });

  it("should switch components when observable value changes", () => {
    const mode = new Seidr<"list" | "grid">("list");
    const listElement = $("div");
    const gridElement = $("div");

    mountSwitch(
      mode,
      {
        list: () => listElement,
        grid: () => gridElement,
      },
      container,
    );

    expect(container.contains(listElement)).toBe(true);
    expect(container.contains(gridElement)).toBe(false);

    mode.value = "grid";

    expect(container.contains(listElement)).toBe(false);
    expect(container.contains(gridElement)).toBe(true);
  });

  it("should handle missing component factories gracefully", () => {
    const mode = new Seidr<"list" | "grid" | "unknown">("unknown" as const);
    const listElement = $("div");
    const gridElement = $("div");

    // Use type assertion to allow 'unknown' key
    mountSwitch(
      mode as Seidr<"list" | "grid">,
      {
        list: () => listElement,
        grid: () => gridElement,
      },
      container,
    );

    expect(container.contains(listElement)).toBe(false);
    expect(container.contains(gridElement)).toBe(false);
    expect(container.children.length).toBe(0);
  });

  it("should clean up when destroyed", () => {
    const mode = new Seidr<"list" | "grid">("list");
    const listElement = $("div");
    let componentDestroyed = false;

    const cleanup = mountSwitch(
      mode,
      {
        list: () => {
          const comp = component(() => listElement)();
          const originalDestroy = comp.destroy;
          comp.destroy = () => {
            componentDestroyed = true;
            originalDestroy();
          };
          return comp;
        },
        grid: () => component(() => $("div"))(),
      },
      container,
    );

    expect(container.contains(listElement)).toBe(true);
    expect(componentDestroyed).toBe(false);

    cleanup();

    expect(container.contains(listElement)).toBe(false);
    expect(componentDestroyed).toBe(true);
  });

  it("should support Map as factories", () => {
    const mode = new Seidr<"list" | "grid">("list");
    const listElement = $("div", { textContent: "list" });
    const gridElement = $("div", { textContent: "grid" });

    const factories = new Map<"list" | "grid", () => any>();
    factories.set("list", () => listElement);
    factories.set("grid", () => gridElement);

    mountSwitch(mode, factories, container);

    expect(container.contains(listElement)).toBe(true);

    mode.value = "grid";
    expect(container.contains(listElement)).toBe(false);
    expect(container.contains(gridElement)).toBe(true);
  });

  it("should support defaultCase when no match is found", () => {
    const mode = new Seidr<string>("unknown");
    const defaultElement = $("div", { textContent: "default" });

    mountSwitch(
      mode,
      {
        list: () => $("div"),
      },
      container,
      () => defaultElement,
    );

    expect(container.contains(defaultElement)).toBe(true);
  });

  it("should support raw functions as component factories", () => {
    const mode = new Seidr<"a" | "b">("a");
    const elementA = $("div", { className: "a" });
    const elementB = $("div", { className: "b" });

    mountSwitch(
      mode,
      {
        a: () => elementA,
        b: () => elementB,
      },
      container,
    );

    expect(container.contains(elementA)).toBe(true);

    mode.value = "b";
    expect(container.contains(elementA)).toBe(false);
    expect(container.contains(elementB)).toBe(true);
  });

  it("should pass the current value to the factory", () => {
    const mode = new Seidr<"first" | "second">("first");
    const receivedValues: string[] = [];

    mountSwitch(
      mode,
      {
        first: (val: string) => {
          receivedValues.push(val);
          return $("div");
        },
        second: (val: string) => {
          receivedValues.push(val);
          return $("div");
        },
      },
      container,
    );

    expect(receivedValues).toContain("first");
    mode.value = "second";
    expect(receivedValues).toContain("second");
  });

  it("should cleanup all reactive observers after unmount", () => {
    const mode = new Seidr<"A" | "B">("A");
    const textA = new Seidr("content A");
    const textB = new Seidr("content B");

    expect(mode.observerCount()).toBe(0);
    expect(textA.observerCount()).toBe(0);

    const cleanup = mountSwitch(
      mode,
      {
        A: () => $("div", { textContent: textA }),
        B: () => $("div", { textContent: textB }),
      },
      container,
    );

    expect(mode.observerCount()).toBe(1);
    expect(textA.observerCount()).toBe(1);

    cleanup();

    expect(mode.observerCount()).toBe(0);
    expect(textA.observerCount()).toBe(0);
  });

  it("should cleanup observers when switching branches", () => {
    const mode = new Seidr<"A" | "B">("A");
    const textA = new Seidr("content A");
    const textB = new Seidr("content B");

    mountSwitch(
      mode,
      {
        A: () => $("div", { textContent: textA }),
        B: () => $("div", { textContent: textB }),
      },
      container,
    );

    expect(textA.observerCount()).toBe(1);
    expect(textB.observerCount()).toBe(0);

    mode.value = "B";

    expect(textA.observerCount()).toBe(0);
    expect(textB.observerCount()).toBe(1);

    mode.value = "A";
    expect(textA.observerCount()).toBe(1);
    expect(textB.observerCount()).toBe(0);
  });

  it("should call onAttached when switching components", () => {
    const mode = new Seidr<"A" | "B">("A");
    const onAttached = vi.fn();

    mountSwitch(
      mode,
      {
        A: () => {
          const scope = useScope();
          scope.onAttached = () => onAttached("A");
          return $("div");
        },
        B: () => {
          const scope = useScope();
          scope.onAttached = () => onAttached("B");
          return $("div");
        },
      },
      container,
    );

    expect(onAttached).toHaveBeenCalledWith("A");
    onAttached.mockClear();

    mode.value = "B";
    expect(onAttached).toHaveBeenCalledWith("B");
  });
});
