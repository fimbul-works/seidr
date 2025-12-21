import { beforeEach, describe, expect, it } from "vitest";
import { toggleClass } from "./toggle-class.js";
import { ObservableValue } from "./value.js";

describe("toggleClass", () => {
  let element: HTMLElement;
  let observable: ObservableValue<boolean>;

  beforeEach(() => {
    element = document.createElement("div");
    observable = new ObservableValue(false);
  });

  it("should add class when observable is true", () => {
    observable.value = true;

    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(true);

    cleanup();
  });

  it("should remove class when observable is false", () => {
    observable.value = false;

    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(false);

    cleanup();
  });

  it("should toggle class when observable changes", () => {
    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(false);

    observable.value = true;

    expect(element.classList.contains("active")).toBe(true);

    observable.value = false;

    expect(element.classList.contains("active")).toBe(false);

    cleanup();
  });

  it("should return cleanup function", () => {
    const cleanup = toggleClass(observable, element, "active");

    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("should stop updating after cleanup", () => {
    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(false);

    cleanup();

    observable.value = true;

    // Class should not be added after cleanup
    expect(element.classList.contains("active")).toBe(false);
  });

  it("should work with existing classes on element", () => {
    element.classList.add("existing");
    observable.value = true;

    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("existing")).toBe(true);
    expect(element.classList.contains("active")).toBe(true);

    cleanup();

    expect(element.classList.contains("existing")).toBe(true);
    // toggleClass cleanup doesn't remove the class, it just stops observing changes
    expect(element.classList.contains("active")).toBe(true);
  });
});
