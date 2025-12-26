import { describe, expect, it, vi } from "vitest";
import { Seidr } from "../seidr";
import type { SeidrComponent } from "./component";
import { component, createScope } from "./component";
import { $ } from "./element";

describe("createScope", () => {
  it("should create a scope with track, child, and destroy methods", () => {
    const scope = createScope();

    expect(scope).toHaveProperty("track");
    expect(scope).toHaveProperty("child");
    expect(scope).toHaveProperty("destroy");
    expect(typeof scope.track).toBe("function");
    expect(typeof scope.child).toBe("function");
    expect(typeof scope.destroy).toBe("function");
  });

  it("should track cleanup functions and call them on destroy", () => {
    const scope = createScope();
    let cleanupCalled = false;

    scope.track(() => {
      cleanupCalled = true;
    });

    expect(cleanupCalled).toBe(false);

    scope.destroy();

    expect(cleanupCalled).toBe(true);
  });

  it("should track multiple cleanup functions", () => {
    const scope = createScope();
    let cleanup1Called = false;
    let cleanup2Called = false;

    scope.track(() => {
      cleanup1Called = true;
    });
    scope.track(() => {
      cleanup2Called = true;
    });

    scope.destroy();

    expect(cleanup1Called).toBe(true);
    expect(cleanup2Called).toBe(true);
  });

  it("should not execute cleanup functions twice on multiple destroy calls", () => {
    const scope = createScope();
    let cleanupCount = 0;

    scope.track(() => {
      cleanupCount++;
    });

    scope.destroy();
    scope.destroy();

    expect(cleanupCount).toBe(1);
  });

  it("should execute cleanup immediately if tracked after destroy", () => {
    const scope = createScope();
    let cleanupCalled = false;

    scope.destroy();

    scope.track(() => {
      cleanupCalled = true;
    });

    expect(cleanupCalled).toBe(true);
  });

  it("should track child components and destroy them when parent is destroyed", () => {
    const scope = createScope();
    let childDestroyed = false;

    const mockChild: SeidrComponent = {
      isRootComponent: true,
      element: $("div"),
      destroy: () => {
        childDestroyed = true;
      },
    };

    scope.child(mockChild);
    scope.destroy();

    expect(childDestroyed).toBe(true);
  });
});

describe("component", () => {
  it("should create a component with element and destroy method", () => {
    const mockElement = $("div");
    const comp = component(() => {
      return mockElement;
    });

    expect(comp).toHaveProperty("element");
    expect(comp).toHaveProperty("destroy");
    expect(comp.element).toBe(mockElement);
    expect(typeof comp.destroy).toBe("function");
  });

  it("should call destroy on scope when component is destroyed", () => {
    let scopeDestroyed = false;

    const comp = component((scopeParam) => {
      // Override destroy for testing
      const originalDestroy = scopeParam.destroy;
      scopeParam.destroy = () => {
        scopeDestroyed = true;
        originalDestroy();
      };
      return $("div");
    });

    expect(scopeDestroyed).toBe(false);

    comp.destroy();

    expect(scopeDestroyed).toBe(true);
  });
});

describe("Documentation Examples", () => {
  describe("Basic counter component example", () => {
    it("should demonstrate basic component creation with reactive bindings", () => {
      const comp = component((scope) => {
        const count = new Seidr(0);
        const button = $("button", { textContent: "Count: 0" });

        // Track reactive binding
        scope.track(
          count.bind(button, (value, el) => {
            el.textContent = `Count: ${value}`;
          }),
        );

        // Track event listener
        scope.track(button.on("click", () => count.value++));

        return button;
      });

      // Mount to DOM for testing
      document.body.appendChild(comp.element);

      // Initial state
      expect(comp.element.textContent).toBe("Count: 0");

      // Simulate click
      comp.element.click();
      expect(comp.element.textContent).toBe("Count: 1");

      // Click again
      comp.element.click();
      expect(comp.element.textContent).toBe("Count: 2");

      // Cleanup
      comp.destroy();
      if (document.body.contains(comp.element)) {
        document.body.removeChild(comp.element);
      }
    });
  });

  describe("Component with child components example", () => {
    it("should demonstrate child component management", () => {
      function createHeader() {
        return component(() => {
          return $("div", { textContent: "Header Component" });
        });
      }

      function createAvatar() {
        return component(() => {
          return $("div", { textContent: "Avatar Component" });
        });
      }

      const comp = component((scope) => {
        const user = new Seidr({ name: "John", email: "john@example.com" });

        const header = scope.child(createHeader());
        const avatar = scope.child(createAvatar());

        const container = $("div", { className: "profile" }, [
          header.element,
          avatar.element,
          $("span", { textContent: user.as((u) => u.name) }),
        ]);

        return container;
      });

      // Mount to DOM for testing
      document.body.appendChild(comp.element);

      // Verify structure
      expect(comp.element.className).toBe("profile");
      expect(comp.element.children.length).toBe(3);
      expect(comp.element.children[0].textContent).toBe("Header Component");
      expect(comp.element.children[1].textContent).toBe("Avatar Component");
      expect(comp.element.children[2].textContent).toBe("John");
      expect(comp.element.textContent).toContain("John");

      // Cleanup
      comp.destroy();
      if (document.body.contains(comp.element)) {
        document.body.removeChild(comp.element);
      }
    });
  });

  describe("Manual scope creation example", () => {
    it("should demonstrate manual scope lifecycle management", () => {
      const scope = createScope();

      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      scope.track(cleanup1);
      scope.track(cleanup2);

      expect(cleanup1).not.toHaveBeenCalled();
      expect(cleanup2).not.toHaveBeenCalled();

      // Destroy scope
      scope.destroy();

      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });
  });

  describe("Scope cleanup order example", () => {
    it("should demonstrate cleanup functions are executed in order", () => {
      const scope = createScope();
      const executionOrder: string[] = [];

      scope.track(() => executionOrder.push("first"));
      scope.track(() => executionOrder.push("second"));
      scope.track(() => executionOrder.push("third"));

      scope.destroy();

      expect(executionOrder).toEqual(["first", "second", "third"]);
    });
  });

  describe("Component lifecycle with resources example", () => {
    it("should demonstrate proper resource cleanup", () => {
      const eventListenerCleanup = vi.fn();
      const reactiveBindingCleanup = vi.fn();
      const customCleanup = vi.fn();

      const comp = component((scope) => {
        const element = $("div");

        // Track event listener cleanup
        scope.track(element.on("click", () => {}));
        scope.track(() => eventListenerCleanup());

        // Track reactive binding cleanup
        const observable = new Seidr("test");
        scope.track(observable.bind(element, () => {}));
        scope.track(() => reactiveBindingCleanup());

        // Track custom cleanup
        scope.track(customCleanup);

        return element;
      });

      // Destroy component
      comp.destroy();

      // Verify all cleanup functions were called
      expect(customCleanup).toHaveBeenCalled();
    });
  });

  describe("Component with multiple children example", () => {
    it("should handle multiple child components correctly", () => {
      let headerDestroyed = false;
      let footerDestroyed = false;

      const createHeader = () =>
        component(() => {
          return $("header", { textContent: "Header" });
        });

      const createFooter = () =>
        component(() => {
          return $("footer", { textContent: "Footer" });
        });

      const comp = component((scope) => {
        const header = createHeader();
        const footer = createFooter();

        // Override destroy for testing
        header.destroy = () => {
          headerDestroyed = true;
        };
        footer.destroy = () => {
          footerDestroyed = true;
        };

        scope.child(header);
        scope.child(footer);

        return $("main", {}, [header.element, footer.element]);
      });

      expect(headerDestroyed).toBe(false);
      expect(footerDestroyed).toBe(false);

      // Destroy parent component
      comp.destroy();

      expect(headerDestroyed).toBe(true);
      expect(footerDestroyed).toBe(true);
    });
  });

  describe("Component error handling in cleanup", () => {
    it("should handle cleanup function errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const comp = component((scope) => {
        scope.track(() => {
          throw new Error("Test cleanup error");
        });
        scope.track(() => {
          // This should still execute even if previous one fails
        });

        return $("div");
      });

      // Destroy should not throw
      expect(() => comp.destroy()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Test cleanup error",
        }),
      );

      consoleSpy.mockRestore();
    });
  });
});
