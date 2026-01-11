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
});
