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

    mountConditional(
      condition,
      component(() => mockElement),
      container,
    );

    expect(container.contains(mockElement)).toBe(true);
  });

  it("should not mount component when condition is false", () => {
    const condition = new Seidr(false);
    const mockElement = $("div");

    mountConditional(
      condition,
      component(() => mockElement),
      container,
    );

    expect(container.contains(mockElement)).toBe(false);
  });

  it("should toggle component based on condition changes", () => {
    const condition = new Seidr(false);
    const mockElement = $("div");

    mountConditional(
      condition,
      component(() => mockElement),
      container,
    );

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
        const comp = component(() => mockElement)();
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

  it("should support raw functions as component factories", () => {
    const condition = new Seidr(true);
    const mockElement = $("div", { className: "raw-fn-element" });

    mountConditional(condition, () => mockElement, container);

    expect(container.contains(mockElement)).toBe(true);
    expect(mockElement.className).toBe("raw-fn-element");

    condition.value = false;
    expect(container.contains(mockElement)).toBe(false);
  });

  it("should cleanup all reactive observers after unmount", () => {
    const condition = new Seidr(true);
    const text = new Seidr("content");

    expect(condition.observerCount()).toBe(0);
    expect(text.observerCount()).toBe(0);

    const cleanup = mountConditional(condition, () => $("div", { textContent: text }), container);

    expect(condition.observerCount()).toBe(1);
    expect(text.observerCount()).toBe(1);

    cleanup();

    expect(condition.observerCount()).toBe(0);
    expect(text.observerCount()).toBe(0);
  });

  it("should cleanup observers when switching branches", () => {
    const condition = new Seidr(true);
    const textA = new Seidr("A");
    const textB = new Seidr("B");

    mountConditional(condition, () => $("div", { textContent: textA }), container);

    expect(textA.observerCount()).toBe(1);
    expect(textB.observerCount()).toBe(0);

    condition.value = false;

    expect(textA.observerCount()).toBe(0);
    expect(textB.observerCount()).toBe(0); // false has no branch here

    condition.value = true;
    expect(textA.observerCount()).toBe(1);
  });
});
