import { beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "../seidr";
import { $, type SeidrElement } from "./element";
import { elementClassToggle } from "./element-class-toggle";

describe("$ (createElement)", () => {
  it("should create basic HTML element", () => {
    const div = $("div");

    expect(div.tagName).toBe("DIV");
    expect(div instanceof HTMLElement).toBe(true);
  });

  it("should assign properties to element", () => {
    const div = $("div", {
      id: "test-id",
      className: "test-class",
      textContent: "Hello World",
    });

    expect(div.id).toBe("test-id");
    expect(div.className).toBe("test-class");
    expect(div.textContent).toBe("Hello World");
  });

  it("should append children to element", () => {
    const child1 = document.createElement("span");
    const child2 = document.createTextNode("text");
    const div = $("div", {}, [child1, child2]);

    expect(div.children.length).toBe(1);
    expect(div.children[0]).toBe(child1);
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[1]).toBe(child2);
  });

  it("should add on method to element", () => {
    const div = $("div");

    expect("on" in div).toBe(true);
    expect(typeof (div as any).on).toBe("function");
  });

  it("should work with different HTML elements", () => {
    const button = $("button", { type: "button", textContent: "Click me" });
    const input = $("input", { type: "text", placeholder: "Enter text" });
    const anchor = $("a", { href: "#", textContent: "Link" });

    expect(button.tagName).toBe("BUTTON");
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Click me");

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("text");
    expect(input.placeholder).toBe("Enter text");

    expect(anchor.tagName).toBe("A");
    expect(anchor.href).toContain("#");
    expect(anchor.textContent).toBe("Link");
  });
});

describe("element on method", () => {
  it("should provide on method on created elements", () => {
    const div = $("div");
    const handler = vi.fn();

    expect("on" in div).toBe(true);

    // TypeScript should infer the correct types
    const cleanup = (div as SeidrElement).on("click", handler);

    expect(typeof cleanup).toBe("function");

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  describe("toggleClass", () => {
    let element: SeidrElement;
    let observable: Seidr<boolean>;

    beforeEach(() => {
      element = $("div");
      observable = new Seidr(false);
    });

    it("should add class when observable is true", () => {
      observable.value = true;

      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(true);

      cleanup();
    });

    it("should remove class when observable is false", () => {
      observable.value = false;

      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(false);

      cleanup();
    });

    it("should toggle class when observable changes", () => {
      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("active")).toBe(false);

      observable.value = true;

      expect(element.classList.contains("active")).toBe(true);

      observable.value = false;

      expect(element.classList.contains("active")).toBe(false);

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

    it("should work with existing classes on element", () => {
      element.classList.add("existing");
      observable.value = true;

      const cleanup = elementClassToggle(element, "active", observable);

      expect(element.classList.contains("existing")).toBe(true);
      expect(element.classList.contains("active")).toBe(true);

      cleanup();

      expect(element.classList.contains("existing")).toBe(true);
      // elementClassToggle cleanup doesn't remove the class, it just stops observing changes
      expect(element.classList.contains("active")).toBe(true);
    });
  });

  describe("Documentation Examples", () => {
    describe("Basic element creation example", () => {
      it("should create elements with basic properties", () => {
        const button = $("button", {
          textContent: "Click me",
          className: "btn btn-primary",
        });

        expect(button.tagName).toBe("BUTTON");
        expect(button.textContent).toBe("Click me");
        expect(button.className).toBe("btn btn-primary");
        expect(button.type).toBe("submit"); // Default button type
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
          () => $("button", { textContent: "Dynamic" }), // Function child
        ]);

        expect(container.className).toBe("container");
        expect(container.children.length).toBe(3);
        expect(container.children[0].tagName).toBe("H1");
        expect(container.children[0].textContent).toBe("Title");
        expect(container.children[1].tagName).toBe("P");
        expect(container.children[1].textContent).toBe("Description");
        expect(container.children[2].tagName).toBe("BUTTON");
        expect(container.children[2].textContent).toBe("Dynamic");
        expect(container.childNodes.length).toBe(3); // Including button from function
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
});
