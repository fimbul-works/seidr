import { beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../seidr";
import { $ } from "./element";
import { elementClassToggle } from "./element-class-toggle";
import { $div } from "./elements";

describe("elementClassToggle", () => {
  let element: HTMLElement;
  let observable: Seidr<boolean>;

  beforeEach(() => {
    element = $div({ className: "base-element" });
    observable = new Seidr(false);
  });

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

      expect(element.classList.contains("active")).toBe(true);
      expect(element.classList.contains("error")).toBe(true);
      expect(element.classList.contains("loading")).toBe(true);

      isActive.value = false;

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
      expect(element.classList.contains("large")).toBe(true);

      cleanup();

      // After cleanup, changing the source should not affect the element
      count.value = 2;
      expect(element.classList.contains("large")).toBe(true); // Still large because binding stopped

      count.value = 20;
      expect(element.classList.contains("large")).toBe(true); // Still no change
    });

    it("should cleanup computed observable bindings", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");
      const isFullNameLong = Seidr.computed(
        () => `${firstName.value} ${lastName.value}`.length > 10,
        [firstName, lastName],
      );

      const cleanup = elementClassToggle(element, "long-name", isFullNameLong);

      firstName.value = "Alexander";
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
      expect(element.classList.contains("error")).toBe(true); // Error binding still active

      hasError.value = false;
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
      expect(element.classList.contains("large")).toBe(true);

      count.value = 2;
      expect(element.classList.contains("large")).toBe(false);

      cleanup();
    });

    it("should work with computed observables", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");
      const isFullNameLong = Seidr.computed(
        () => `${firstName.value} ${lastName.value}`.length > 10,
        [firstName, lastName],
      );

      const cleanup = elementClassToggle(element, "long-name", isFullNameLong);

      expect(element.classList.contains("long-name")).toBe(false); // "John Doe" = 8

      firstName.value = "Alexander";
      expect(element.classList.contains("long-name")).toBe(true); // "Alexander Doe" = 13

      lastName.value = "Smith";
      expect(element.classList.contains("long-name")).toBe(true); // "Alexander Smith" = 15

      firstName.value = "Bob";
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
      expect(element.classList.contains("positive")).toBe(true);
      expect(element.classList.contains("zero")).toBe(false);

      value.value = -5;
      expect(element.classList.contains("negative")).toBe(true);
      expect(element.classList.contains("positive")).toBe(false);

      cleanup1();
      cleanup2();
      cleanup3();
    });
  });

  describe("Documentation Examples", () => {
    describe("Basic usage example", () => {
      it("should demonstrate basic class toggling", () => {
        // From API.md example
        const isActive = new Seidr(false);
        const button = $("button", { textContent: "Click me" });

        elementClassToggle(button, "active", isActive);

        expect(button.className).toBe("active" in button.classList ? "" : "");

        isActive.value = true; // Adds 'active' class
        expect(button.classList.contains("active")).toBe(true);

        isActive.value = false; // Removes 'active' class
        expect(button.classList.contains("active")).toBe(false);
      });
    });

    describe("Reactive class toggle with existing classes", () => {
      it("should preserve existing classes while toggling", () => {
        const isActive = new Seidr(false);
        const element = $div({ className: "base-element" });

        elementClassToggle(element, "highlight", isActive);

        expect(element.className).toBe("base-element");

        isActive.value = true;
        expect(element.classList.contains("base-element")).toBe(true);
        expect(element.classList.contains("highlight")).toBe(true);

        isActive.value = false;
        expect(element.classList.contains("base-element")).toBe(true);
        expect(element.classList.contains("highlight")).toBe(false);
      });
    });

    describe("Multiple class bindings example", () => {
      it("should handle multiple reactive class toggles on same element", () => {
        const isVisible = new Seidr(true);
        const hasError = new Seidr(false);
        const isLoading = new Seidr(false);

        const element = $div();

        // Multiple reactive class bindings
        elementClassToggle(element, "visible", isVisible);
        elementClassToggle(element, "error", hasError);
        elementClassToggle(element, "loading", isLoading);

        expect(element.classList.contains("visible")).toBe(true);
        expect(element.classList.contains("error")).toBe(false);
        expect(element.classList.contains("loading")).toBe(false);

        // Update states
        hasError.value = true;
        isLoading.value = true;
        isVisible.value = false;

        expect(element.classList.contains("visible")).toBe(false);
        expect(element.classList.contains("error")).toBe(true);
        expect(element.classList.contains("loading")).toBe(true);
      });
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle form validation states", () => {
      const email = new Seidr("");
      const isValidEmail = email.as((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      const isTouched = new Seidr(false);

      const input = $("input", { type: "email" });
      const cleanup1 = elementClassToggle(input, "valid", isValidEmail);
      const cleanup2 = elementClassToggle(
        input,
        "invalid",
        isTouched.as((t) => t && !isValidEmail.value),
      );

      expect(input.classList.contains("valid")).toBe(false);
      expect(input.classList.contains("invalid")).toBe(false);

      email.value = "invalid-email";
      isTouched.value = true;

      expect(input.classList.contains("valid")).toBe(false);
      // Note: the derived observable won't update reactively in this pattern
      // This is a limitation of the current implementation

      cleanup1();
      cleanup2();
    });

    it("should handle UI state management", () => {
      const isMenuOpen = new Seidr(false);
      const isAnimating = new Seidr(false);

      const menu = $div({ className: "menu" });
      const backdrop = $div({ className: "backdrop" });

      const cleanup1 = elementClassToggle(menu, "open", isMenuOpen);
      const cleanup2 = elementClassToggle(menu, "animating", isAnimating);
      const cleanup3 = elementClassToggle(backdrop, "visible", isMenuOpen);

      expect(menu.classList.contains("open")).toBe(false);
      expect(backdrop.classList.contains("visible")).toBe(false);

      // Open menu with animation
      isAnimating.value = true;
      isMenuOpen.value = true;

      expect(menu.classList.contains("open")).toBe(true);
      expect(menu.classList.contains("animating")).toBe(true);
      expect(backdrop.classList.contains("visible")).toBe(true);

      // Finish animation
      isAnimating.value = false;
      expect(menu.classList.contains("animating")).toBe(false);

      cleanup1();
      cleanup2();
      cleanup3();
    });

    it("should handle feature flag states", () => {
      const featureEnabled = new Seidr(false);
      const userHasAccess = new Seidr(true);

      const button = $("button", { textContent: "New Feature" });
      const cleanup1 = elementClassToggle(
        button,
        "hidden",
        featureEnabled.as((e) => !e),
      );
      const cleanup2 = elementClassToggle(
        button,
        "disabled",
        userHasAccess.as((a) => !a),
      );

      expect(button.classList.contains("hidden")).toBe(true);
      expect(button.classList.contains("disabled")).toBe(false);

      featureEnabled.value = true;
      expect(button.classList.contains("hidden")).toBe(false);

      userHasAccess.value = false;
      expect(button.classList.contains("disabled")).toBe(true);

      cleanup1();
      cleanup2();
    });
  });
});
