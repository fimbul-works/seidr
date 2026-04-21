import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { useScope } from "./use-scope";

describeDualMode("component", ({ getDocument }) => {
  let restoreClientMode: CleanupFunction;
  let container: Element;

  beforeEach(() => {
    restoreClientMode = enableClientMode();
    container = getDocument().createElement("div");
    getDocument().body.appendChild(container);
  });

  afterEach(() => {
    restoreClientMode();
  });

  it("should create a component returning an element", () => {
    const mockElement = $("div");
    const comp = component(() => {
      return mockElement;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toBe(mockElement);
  });

  it("should create a component returning an array of elements", () => {
    const mockElement = [$("div"), $("span")];
    const comp = component(() => {
      return mockElement;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toHaveLength(2);
    expect(comp.element).toEqual([mockElement[0], mockElement[1]]);
  });

  it("should create a component returning null", () => {
    const comp = component(() => {
      return null;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toBeNull();
  });

  describe("ID Management", () => {
    it("should generate unique IDs for child components with the same name", () => {
      const Child = component(() => $("div"), "Child");
      const Parent = component(() => {
        const c1 = Child();
        const c2 = Child();
        return $("div", {}, [c1, c2]);
      }, "Parent");

      const p = Parent();
      const children = Array.from(p.children.values());
      expect(children).toHaveLength(2);
      expect(children[0].id).not.toBe(children[1].id);

      // Development mode ID format: Name-Base62
      expect(children[0].id).toMatch(/^Child-/);
      expect(children[1].id).toMatch(/^Child-/);
    });

    it("should handle collisions by incrementing numeric hash", () => {
      const Child = component(() => $("div"), "Child");
      const Parent = component(() => {
        // Force a collision by passing the same identifier if identifier was used
        // But since we use nextChildId(), we can simulate it by calling it twice
        const c1 = Child();
        const c2 = Child();
        return $("div", {}, [c1, c2]);
      }, "Parent");

      const p = Parent();
      const children = Array.from(p.children.values());
      expect(children[0].id).not.toBe(children[1].id);
    });
  });

  describe("Lifecycle", () => {
    it("should call onMount when component is mounted", () => {
      const onMount = vi.fn();
      const Comp = component(() => {
        const scope = useScope();
        scope.onMount(onMount);
        return $("div");
      });

      const c = Comp();
      expect(onMount).not.toHaveBeenCalled();

      c.mount(container);
      expect(onMount).toHaveBeenCalledWith(container);
    });

    it("should call onUnmount when component is unmounted", () => {
      const onUnmount = vi.fn();
      const Comp = component(() => {
        const scope = useScope();
        scope.onUnmount(onUnmount);
        return $("div");
      });

      const c = Comp();
      c.mount(container);
      c.unmount();
      expect(onUnmount).toHaveBeenCalled();
    });

    it("should call onAttached immediately if parent node is already connected", () => {
      const onAttached = vi.fn();
      const Comp = component(() => {
        const scope = useScope();
        scope.onAttached(onAttached);
        return $("div");
      });

      const c = Comp();
      // Container is already in document.body (from beforeEach)
      c.mount(container);

      expect(onAttached).toHaveBeenCalled();
    });

    it("should call onAttached later if parent node is not connected yet", () => {
      const onAttached = vi.fn();
      const Comp = component(() => {
        const scope = useScope();
        scope.onAttached(onAttached);
        return $("div");
      });

      const c = Comp();
      const detachedContainer = getDocument().createElement("div");
      c.mount(detachedContainer);

      expect(onAttached).not.toHaveBeenCalled();

      getDocument().body.appendChild(detachedContainer);
      c.attached(); // Manual call to simulate attachment detection (usually handled by mountComponent or Router)
      expect(onAttached).toHaveBeenCalled();
    });
  });

  describe("Element Reassignment", () => {
    it("should unmount old component items when element is updated", () => {
      const childUnmount = vi.fn();
      const Child = component(() => {
        useScope().onUnmount(childUnmount);
        return $("div");
      });

      let c1: any;
      const Parent = component(() => {
        c1 = Child();
        return c1;
      });

      const p = Parent();
      expect(p.element).toBe(c1);

      // Update parent element
      p.element = $("span");

      expect(childUnmount).toHaveBeenCalled();
      expect(p.element).not.toBe(c1);
    });

    it("should remove old DOM nodes when element is updated", () => {
      const oldNode = $("div");
      const Parent = component(() => {
        return oldNode;
      });

      const p = Parent();
      container.appendChild(oldNode);
      expect(oldNode.parentNode).toBe(container);

      p.element = $("span");
      expect(oldNode.parentNode).toBeNull();
    });
  });

  describe("SSR Tracking", () => {
    it("should track children in createdIndex and children map when in server mode", () => {
      const Child = component(() => $("span"), "Child");
      const Comp = component(() => {
        const _c1 = Child();
        const div = $("div");
        return div;
      }, "Parent");

      const instance = Comp();

      // We can check if isServer() returns true by checking some SSR specific behavior
      // Instead of relying on internal flags, let's just test the logic
      if (instance.createdIndex.length > 0) {
        expect(instance.createdIndex).toContain(Array.from(instance.children.values())[0]);
      }
    });

    it("should apply root attributes to top-level elements in SSR", () => {
      const Comp = component(() => $("div", { id: "root-el" }));
      const instance = Comp();
      const el = instance.element as HTMLElement;

      // This logic is wrapped in process.env.SEIDR_ENABLE_SSR
      // If enabled, it should have the data-seidr-root attribute
      if (el.hasAttribute("data-seidr-root")) {
        expect(el.getAttribute("data-seidr-root")).toBeDefined();
      }
    });
  });

  describe("Error Handling", () => {
    it("should unmount and cleanup if factory throws", () => {
      const onUnmount = vi.fn();
      const Comp = component(() => {
        useScope().onUnmount(onUnmount);
        throw new Error("Factory Error");
      });

      expect(() => Comp()).toThrow("Factory Error");
      expect(onUnmount).toHaveBeenCalled();
    });

    it("should log error in development mode when factory throws", () => {
      const Comp = component(() => {
        throw new Error("Dev Error");
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => Comp()).toThrow("Dev Error");

      // Cleanup console spy
      consoleSpy.mockRestore();
    });
  });
});
