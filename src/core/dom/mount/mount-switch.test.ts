import { beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mountSwitch } from "./mount-switch";

describe("mountSwitch", () => {
  let container: HTMLElement;

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
        list: component(() => listElement),
        grid: component(() => gridElement),
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
        list: component(() => listElement),
        grid: component(() => gridElement),
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
        list: component(() => listElement),
        grid: component(() => gridElement),
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
        grid: component(() => $("div")),
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

  it("should pass the current value to the raw function factory", () => {
    const mode = new Seidr<string>("first");
    let receivedValue = "";

    mountSwitch(
      mode,
      {
        first: (val: string) => {
          receivedValue = val;
          return $("div");
        },
      },
      container,
    );

    expect(receivedValue).toBe("first");

    mode.value = "second";
    // Since 'second' is not in factories, and no defaultCase, receivedValue won't change from factory call
    // Wait, if I change it to another one that exists:
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
});
