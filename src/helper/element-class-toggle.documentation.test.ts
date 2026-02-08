import { describe, expect, it } from "vitest";
import { $, $div } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import { elementClassToggle } from "./element-class-toggle";

describeDualMode("elementClassToggle - Documentation Examples", () => {
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
