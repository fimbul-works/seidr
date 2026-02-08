import { describe, expect, it, vi } from "vitest";
import { elementClassToggle } from "../helper";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import { $ } from "./create-element";

describeDualMode("$ (createElement) - Documentation Examples", ({ isSSR }) => {
  describe("Basic element creation example", () => {
    it("should create elements with basic properties", () => {
      const button = $("button", {
        textContent: "Click me",
        className: "btn btn-primary",
      });

      expect(button.tagName).toBe("BUTTON");
      expect(button.textContent).toBe("Click me");
      expect(button.className).toBe("btn btn-primary");
      if (!isSSR) {
        expect(button.type).toBe("submit"); // Default button type
      }
    });
  });

  describe("Reactive property binding example", () => {
    it("should demonstrate reactive binding with multiple observables", () => {
      const isActive = new Seidr(false);
      const count = new Seidr(0);

      const button = $("button", {
        disabled: isActive, // Reactive disabled property
        textContent: count.as((c) => `Count: ${c}`), // Reactive text content
        className: "btn", // Static property
        onclick: () => count.value++, // Event handler
      });

      // Initial state
      expect(button.disabled).toBe(false);
      expect(button.textContent).toBe("Count: 0");

      // Update observables
      isActive.value = true;
      expect(button.disabled).toBe(true);

      count.value = 5;
      expect(button.textContent).toBe("Count: 5");
    });
  });

  describe("With children elements example", () => {
    it("should create nested element structures", () => {
      const container = $("div", { className: "container" }, [
        $("h1", { textContent: "Title" }),
        $("p", { textContent: "Description" }),
      ]);

      expect(container.className).toBe("container");
      expect(container.children.length).toBe(2);
      expect(container.children[0].tagName).toBe("H1");
      expect(container.children[0].textContent).toBe("Title");
      expect(container.children[1].tagName).toBe("P");
      expect(container.children[1].textContent).toBe("Description");
      expect(container.childNodes.length).toBe(2);
    });
  });

  describe("Complex reactive bindings example", () => {
    it("should handle complex reactive transformations", () => {
      const theme = new Seidr<"light" | "dark">("light");
      const isLoading = new Seidr(false);

      const card = $("div", {
        className: theme.as((t) => `card theme-${t}`),
      });

      // Manually set style for testing since style property has complex typing
      // Initialize the attribute since observe() doesn't call immediately
      card.setAttribute("aria-busy", isLoading.value.toString());
      isLoading.observe((loading) => {
        card.style.opacity = loading ? "0.5" : "1";
        card.setAttribute("aria-busy", loading.toString());
      });

      // Initial state
      expect(card.className).toBe("card theme-light");
      expect(card.style.opacity).toBe("");
      expect(card.getAttribute("aria-busy")).toBe("false");

      // Update state
      theme.value = "dark";
      isLoading.value = true;

      expect(card.className).toBe("card theme-dark");
      expect(card.style.opacity).toBe("0.5");
      expect(card.getAttribute("aria-busy")).toBe("true");
    });
  });

  if (!isSSR) {
    describe("Event handling with cleanup example", () => {
      it("should demonstrate proper event listener cleanup", () => {
        const element = $("button", { textContent: "Click me" });
        const clickSpy = vi.fn();

        const cleanup = element.on("click", (e) => {
          clickSpy(e.type);
        });

        // Simulate click
        element.click();
        expect(clickSpy).toHaveBeenCalledWith("click");

        // Cleanup and try again
        cleanup();
        clickSpy.mockClear();
        element.click();
        expect(clickSpy).not.toHaveBeenCalled();
      });
    });
  }

  describe("Multiple class bindings example", () => {
    it("should handle multiple reactive class toggles", () => {
      const isVisible = new Seidr(true);
      const hasError = new Seidr(false);
      const isLoading = new Seidr(false);

      const element = $("div");

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

  describe("Reserved properties error handling", () => {
    it("should throw error when using reserved properties", () => {
      expect(() => {
        $("div", { on: () => {} } as any);
      }).toThrow('Unallowed property "on"');
    });
  });
});
