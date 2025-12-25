import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodoApp } from "../../../examples/todo.js";
import { Seidr } from "../../seidr.js";
import { component } from "../component.js";
import { $ } from "../element.js";
import { clearHydrationContext } from "./hydration-context.js";
import { renderToString } from "./render-to-string.js";
import { setActiveSSRScope, SSRScope } from "./ssr-scope.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSR Utilities", () => {
  beforeEach(() => {
    // Enable SSR mode for all tests
    // @ts-expect-error
    process.env.SEIDR_TEST_SSR = true;
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear active scope
    setActiveSSRScope(undefined);

    // Clear hydration context
    clearHydrationContext();
  });

  describe("renderToString", () => {
    it("should render simple component and capture state", async () => {
      const { html, hydrationData } = await renderToString(() => {
        return component((_scope) => {
          const count = new Seidr(42);
          return $("div", { className: "counter", textContent: count.as((n) => `Count: ${n}`) });
        });
      });

      expect(html).toContain('<div class="counter"');
      expect(html).toContain("Count: 42");
      // With numeric IDs, the count should be at index 0
      expect(hydrationData.observables[0]).toBe(42);
      // Should have captured the binding
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);
    });

    it("should only capture root observable state", async () => {
      const { html, hydrationData } =await renderToString(() => {
        return component((_scope) => {
          const count = new Seidr(10);
          const doubled = count.as((n) => n * 2);

          return $("div", {}, [
            $("span", { textContent: count.as((n) => `Count: ${n}`) }),
            $("span", { textContent: doubled.as((n) => `Doubled: ${n}`) }),
          ]);
        });
      });

      expect(html).toContain("Count: 10");
      expect(html).toContain("Doubled: 20");
      // Only count should be in observables, not doubled (derived)
      expect(Object.keys(hydrationData.observables)).toHaveLength(1);
      expect(hydrationData.observables[0]).toBe(10);
      // Should have captured bindings for both spans
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);
    });

    it("should capture multiple root observables", async () => {
      const { html, hydrationData } = await renderToString(() => {
        return component((_scope) => {
          const firstName = new Seidr("John");
          const lastName = new Seidr("Doe");
          const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

          return $("div", {}, [$("h1", { textContent: fullName })]);
        });
      });

      expect(html).toContain("John Doe");
      // Only firstName and lastName should be captured (fullName is derived)
      expect(Object.keys(hydrationData.observables)).toHaveLength(2);
      expect(hydrationData.observables[0]).toBe("John");
      expect(hydrationData.observables[1]).toBe("Doe");
      // Should have captured binding
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);
    });

    it("should capture computed dependencies but not computed values", async () => {
      const { html, hydrationData } = await renderToString(() => {
        return component((_scope) => {
          const a = new Seidr(2);
          const b = new Seidr(3);
          const sum = Seidr.computed(() => a.value + b.value, [a, b]);

          return $("div", { textContent: sum.as((s) => `Sum: ${s}`) });
        });
      });

      expect(html).toContain("Sum: 5");
      // Both a and b should be in observables, not sum (computed)
      expect(Object.keys(hydrationData.observables)).toHaveLength(2);
      expect(hydrationData.observables[0]).toBe(2);
      expect(hydrationData.observables[1]).toBe(3);
      // Should have captured binding
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);
    });

    it("should use provided scope", async () => {
      const scope = new SSRScope();

      const { hydrationData } = await renderToString(() => {
        return component((_scope) => {
          const obs = new Seidr(100);
          return $("div", { textContent: obs.as((n) => `${n}`) });
        });
      }, scope);

      expect(scope.size).toBe(0); // scope should be cleared after captureHydrationData
      expect(hydrationData.observables[0]).toBe(100);
      // Should have captured binding
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);
    });

    it("should clean up scope after rendering", async () => {
      const scope = new SSRScope();

      await renderToString(() => {
        return component((_scope) => {
          const obs = new Seidr(42);
          return $("div", { textContent: obs.as((n) => `${n}`) });
        });
      }, scope);

      // Scope SHOULD be cleared automatically by captureHydrationData() to prevent memory leaks
      expect(scope.size).toBe(0);
    });

    it("should handle observables created in nested function calls", async () => {
      const { html, hydrationData } = await renderToString(() => {
        return component((_scope) => {
          const count = new Seidr(5);
          return $("div", { textContent: count.as((n) => `Count: ${n}`) });
        });
      });

      expect(html).toContain("Count: 5");
      expect(Object.keys(hydrationData.observables)).toHaveLength(1);
      // Should have captured binding
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);
    });

    it("should render TODO application", async () => {
      const { html, hydrationData } = await renderToString(TodoApp);

      // Verify HTML structure
      expect(html).toContain('<div class="todo-app">');
      expect(html).toContain("TODO App");
      expect(html).toContain('<ul class="todo-list">');
      expect(html).toContain("Learn Seidr");
      expect(html).toContain('placeholder="What needs to be done?"');

      // Verify observables were captured
      expect(Object.keys(hydrationData.observables).length).toBeGreaterThan(0);
    });
  });
});
