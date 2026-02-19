import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $, $div, type SeidrElement } from "../element";
import { flushSync, Seidr } from "../seidr";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { elementClassToggle } from "./element-class-toggle";

describe("elementClassToggle", () => {
  let element: SeidrElement;
  let observable: Seidr<boolean>;
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
    element = $div({ className: "base-element" });
    observable = new Seidr(false, { sync: true });
  });

  afterEach(() => restore());

  describe("Basic Functionality", () => {
    it("should add class when observable becomes true", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(false);

      observable.value = true;

      expect(element.classList.contains("active")).toBe(true);

      cleanup();
    });

    it("should remove class when observable becomes false", () => {
      observable.value = true;
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(true);

      observable.value = false;

      expect(element.classList.contains("active")).toBe(false);

      cleanup();
    });

    it("should handle initial state correctly when starting false", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(false);

      cleanup();
    });

    it("should handle initial state correctly when starting true", () => {
      observable.value = true;
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(true);

      cleanup();
    });

    it("should toggle class multiple times", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(false);

      observable.value = true;
      expect(element.classList.contains("active")).toBe(true);

      observable.value = false;
      expect(element.classList.contains("active")).toBe(false);

      observable.value = true;
      expect(element.classList.contains("active")).toBe(true);

      cleanup();
    });

    it("should return cleanup function", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(typeof cleanup).toBe("function");
      expect(() => cleanup()).not.toThrow();
    });

    it("should stop updating after cleanup", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(false);

      cleanup();

      observable.value = true;

      // Class should not be added after cleanup
      expect(element.classList.contains("active")).toBe(false);
    });
  });

  describe("Multiple Classes", () => {
    it("should handle multiple independent class toggles on same element", () => {
      const isActive = new Seidr(true);
      const hasError = new Seidr(false);
      const isLoading = new Seidr(false);

      const cleanup1 = elementClassToggle(element, "active", isActive);
      const cleanup2 = elementClassToggle(element, "error", hasError);
      const cleanup3 = elementClassToggle(element, "loading", isLoading);

      expect(element.classList.contains("active")).toBe(true);
      expect(element.classList.contains("error")).toBe(false);
      expect(element.classList.contains("loading")).toBe(false);

      hasError.value = true;
      isLoading.value = true;
      flushSync();

      expect(element.classList.contains("active")).toBe(true);
      expect(element.classList.contains("error")).toBe(true);
      expect(element.classList.contains("loading")).toBe(true);

      isActive.value = false;
      flushSync();

      expect(element.classList.contains("active")).toBe(false);
      expect(element.classList.contains("error")).toBe(true);
      expect(element.classList.contains("loading")).toBe(true);

      cleanup1();
      cleanup2();
      cleanup3();
    });

    it("should work with existing classes on element", () => {
      element.classList.add("existing-class");
      observable.value = true;

      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("existing-class")).toBe(true);
      expect(element.classList.contains("active")).toBe(true);

      observable.value = false;

      expect(element.classList.contains("existing-class")).toBe(true);
      expect(element.classList.contains("active")).toBe(false);

      cleanup();

      // elementClassToggle cleanup doesn't remove the class, it just stops observing
      expect(element.classList.contains("existing-class")).toBe(true);
      expect(element.classList.contains("active")).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid value changes", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      for (let i = 0; i < 10; i++) {
        observable.value = i % 2 === 0;
        flushSync();
        expect(element.classList.contains("active")).toBe(i % 2 === 0);
      }

      cleanup();
    });

    it("should work with different element types", () => {
      const button = $("button");
      const input = $("input");
      const span = $("span");

      const cleanup1 = elementClassToggle(button, "active", observable);
      const cleanup2 = elementClassToggle(input, "focused", observable);
      const cleanup3 = elementClassToggle(span, "highlight", observable);

      observable.value = true;

      expect(button.classList.contains("active")).toBe(true);
      expect(input.classList.contains("focused")).toBe(true);
      expect(span.classList.contains("highlight")).toBe(true);

      cleanup1();
      cleanup2();
      cleanup3();
    });

    it("should handle class names with special characters", () => {
      const cleanup = elementClassToggle(element, "active-state", observable);

      observable.value = true;

      expect(element.classList.contains("active-state")).toBe(true);

      cleanup();
    });
  });

  describe("Cleanup Behavior", () => {
    it("should stop updating after cleanup when starting false", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(false);

      cleanup();

      observable.value = true;

      // Class should not be added after cleanup
      expect(element.classList.contains("active")).toBe(false);

      observable.value = false;

      // Still should not change
      expect(element.classList.contains("active")).toBe(false);
    });

    it("should stop updating after cleanup when starting true", () => {
      observable.value = true;
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(true);

      cleanup();

      observable.value = false;

      // Class should not be removed after cleanup
      expect(element.classList.contains("active")).toBe(true);

      observable.value = true;

      // Still should not change
      expect(element.classList.contains("active")).toBe(true);
    });

    it("should cleanup derived observable bindings", () => {
      const count = new Seidr(0);
      const isLarge = count.as((n) => n > 5);

      const cleanup = elementClassToggle(element, "large", isLarge);

      count.value = 10;
      flushSync();
      expect(element.classList.contains("large")).toBe(true);

      cleanup();

      // After cleanup, changing the source should not affect the element
      count.value = 2;
      expect(element.classList.contains("large")).toBe(true); // Still large because binding stopped

      count.value = 20;
      expect(element.classList.contains("large")).toBe(true); // Still no change
    });

    it("should cleanup merge observable bindings", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");
      const isFullNameLong = Seidr.merge(
        () => `${firstName.value} ${lastName.value}`.length > 10,
        [firstName, lastName],
      );

      const cleanup = elementClassToggle(element, "long-name", isFullNameLong);

      firstName.value = "Alexander";
      flushSync();
      expect(element.classList.contains("long-name")).toBe(true);

      cleanup();

      // After cleanup, changing dependencies should not affect the element
      firstName.value = "Bob";
      expect(element.classList.contains("long-name")).toBe(true); // Still long-name

      lastName.value = "A";
      expect(element.classList.contains("long-name")).toBe(true); // Still no change
    });

    it("should handle independent cleanup of multiple bindings", () => {
      const isActive = new Seidr(true);
      const hasError = new Seidr(false);

      const cleanup1 = elementClassToggle(element, "active", isActive);
      const cleanup2 = elementClassToggle(element, "error", hasError);

      expect(element.classList.contains("active")).toBe(true);
      expect(element.classList.contains("error")).toBe(false);

      // Cleanup only the active binding
      cleanup1();

      // Active should no longer update
      isActive.value = false;
      expect(element.classList.contains("active")).toBe(true); // Still active (binding stopped)

      // Error binding should still work
      hasError.value = true;
      flushSync();
      expect(element.classList.contains("error")).toBe(true); // Error binding still active

      hasError.value = false;
      flushSync();
      expect(element.classList.contains("error")).toBe(false);

      // Cleanup the error binding
      cleanup2();

      // Now error should also stop updating
      hasError.value = true;
      expect(element.classList.contains("error")).toBe(false); // Still no error (binding stopped)
    });

    it("should handle multiple cleanup calls gracefully", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(() => {
        cleanup();
        cleanup();
        cleanup();
      }).not.toThrow();

      // Should still not update after multiple cleanups
      observable.value = true;
      expect(element.classList.contains("active")).toBe(false);
    });
  });

  describe("Integration with Seidr Features", () => {
    it("should work with derived observables", () => {
      const count = new Seidr(0);
      const isLarge = count.as((n) => n > 5);

      const cleanup = elementClassToggle(element, "large", isLarge);

      expect(element.classList.contains("large")).toBe(false);

      count.value = 3;
      expect(element.classList.contains("large")).toBe(false);

      count.value = 10;
      flushSync();
      expect(element.classList.contains("large")).toBe(true);

      count.value = 2;
      flushSync();
      expect(element.classList.contains("large")).toBe(false);

      cleanup();
    });

    it("should work with merge observables", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");
      const isFullNameLong = Seidr.merge(
        () => `${firstName.value} ${lastName.value}`.length > 10,
        [firstName, lastName],
      );

      const cleanup = elementClassToggle(element, "long-name", isFullNameLong);

      expect(element.classList.contains("long-name")).toBe(false); // "John Doe" = 8

      firstName.value = "Alexander";
      flushSync();
      expect(element.classList.contains("long-name")).toBe(true); // "Alexander Doe" = 13

      lastName.value = "Smith";
      flushSync();
      expect(element.classList.contains("long-name")).toBe(true); // "Alexander Smith" = 15

      firstName.value = "Bob";
      flushSync();
      expect(element.classList.contains("long-name")).toBe(false); // "Bob Smith" = 9

      cleanup();
    });

    it("should work with multiple derived observables", () => {
      const value = new Seidr(0);
      const isPositive = value.as((v) => v > 0);
      const isNegative = value.as((v) => v < 0);
      const isZero = value.as((v) => v === 0);

      const cleanup1 = elementClassToggle(element, "positive", isPositive);
      const cleanup2 = elementClassToggle(element, "negative", isNegative);
      const cleanup3 = elementClassToggle(element, "zero", isZero);

      expect(element.classList.contains("zero")).toBe(true);

      value.value = 5;
      flushSync();
      expect(element.classList.contains("positive")).toBe(true);
      expect(element.classList.contains("zero")).toBe(false);

      value.value = -5;
      flushSync();
      expect(element.classList.contains("negative")).toBe(true);
      expect(element.classList.contains("positive")).toBe(false);

      cleanup1();
      cleanup2();
      cleanup3();
    });
  });
});
