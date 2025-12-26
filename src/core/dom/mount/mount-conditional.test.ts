import { beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mountConditional } from "./mount-conditional";

describe("mountConditional", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = $("div");
  });

  it("should mount component when condition is true", () => {
    const condition = new Seidr(true);
    const mockElement = $("div");

    mountConditional(condition, () => component(() => mockElement), container);

    expect(container.contains(mockElement)).toBe(true);
  });

  it("should not mount component when condition is false", () => {
    const condition = new Seidr(false);
    const mockElement = $("div");

    mountConditional(condition, () => component(() => mockElement), container);

    expect(container.contains(mockElement)).toBe(false);
  });

  it("should toggle component based on condition changes", () => {
    const condition = new Seidr(false);
    const mockElement = $("div");

    mountConditional(condition, () => component(() => mockElement), container);

    expect(container.contains(mockElement)).toBe(false);

    condition.value = true;

    expect(container.contains(mockElement)).toBe(true);

    condition.value = false;

    expect(container.contains(mockElement)).toBe(false);
  });

  it("should clean up when destroyed", () => {
    const condition = new Seidr(true);
    const mockElement = $("div");
    let componentDestroyed = false;

    const cleanup = mountConditional(
      condition,
      () => {
        const comp = component(() => mockElement);
        // Override destroy to track if it was called
        const originalDestroy = comp.destroy;
        comp.destroy = () => {
          componentDestroyed = true;
          originalDestroy();
        };
        return comp;
      },
      container,
    );

    expect(container.contains(mockElement)).toBe(true);
    expect(componentDestroyed).toBe(false);

    cleanup();

    expect(container.contains(mockElement)).toBe(false);
    expect(componentDestroyed).toBe(true);
  });
});
