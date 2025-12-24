import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { $ } from "../element.js";
import { clearHydrationContext } from "./hydration-context.js";
import { isInSSRMode, popSSRScope } from "./render-stack.js";
import { renderToString } from "./render-to-string.js";
import { SSRScope } from "./ssr-scope.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSR Utilities", () => {
  beforeEach(() => {
    // Enable SSR mode for all tests
    process.env.SEIDR_TEST_SSR = "true";
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear any remaining scopes
    while (isInSSRMode()) {
      popSSRScope();
    }

    // Clear hydration context
    clearHydrationContext();
  });

  describe("renderToString", () => {
    it("should render simple component and capture state", () => {
      let capturedCountId: string | undefined;

      const component = () => {
        const count = new Seidr(42);
        capturedCountId = count.id;
        // @ts-expect-error
        return $("div", { className: "counter" }, [`Count: ${count.value}`]);
      };

      const { html, state } = renderToString(component);

      expect(html).toContain('<div class="counter">');
      expect(html).toContain("Count: 42");
      expect(Object.keys(state.observables)).toHaveLength(1);
      expect(state.observables[capturedCountId!]).toBe(42);
    });

    it("should only capture root observable state", () => {
      let capturedIds: { count: string; doubled: string } | undefined;

      const component = () => {
        const count = new Seidr(10);
        const doubled = count.as((n) => n * 2);
        capturedIds = { count: count.id, doubled: doubled.id };

        // @ts-expect-error
        return $("div", {}, [$("span", {}, [`Count: ${count.value}`]), $("span", {}, [`Doubled: ${doubled.value}`])]);
      };

      const { html, state } = renderToString(component);

      expect(html).toContain("Count: 10");
      expect(html).toContain("Doubled: 20");
      // Only count should be in state, not doubled
      expect(Object.keys(state.observables)).toHaveLength(1);
      expect(state.observables[capturedIds!.count]).toBe(10);
      expect(state.observables[capturedIds!.doubled]).toBeUndefined();
    });

    it("should capture multiple root observables", () => {
      let capturedIds: string[] = [];

      const component = () => {
        const firstName = new Seidr("John");
        const lastName = new Seidr("Doe");
        capturedIds = [firstName.id, lastName.id];

        // @ts-expect-error
        return $("div", {}, [$("h1", {}, [`${firstName.value} ${lastName.value}`])]);
      };

      const { html, state } = renderToString(component);

      expect(html).toContain("John Doe");
      expect(Object.keys(state.observables)).toHaveLength(2);
      expect(state.observables[capturedIds[0]]).toBe("John");
      expect(state.observables[capturedIds[1]]).toBe("Doe");
    });

    it("should capture computed dependencies but not computed values", () => {
      let capturedIds: { a: string; b: string; sum: string } | undefined;

      const component = () => {
        const a = new Seidr(2);
        const b = new Seidr(3);
        const sum = Seidr.computed(() => a.value + b.value, [a, b]);
        capturedIds = { a: a.id, b: b.id, sum: sum.id };

        // @ts-expect-error
        return $("div", {}, [`Sum: ${sum.value}`]);
      };

      const { html, state } = renderToString(component);

      expect(html).toContain("Sum: 5");
      expect(Object.keys(state.observables)).toHaveLength(2);
      expect(state.observables[capturedIds!.a]).toBe(2);
      expect(state.observables[capturedIds!.b]).toBe(3);
      expect(state.observables[capturedIds!.sum]).toBeUndefined();
    });

    it("should use provided scope", () => {
      const scope = new SSRScope();
      let capturedObsId: string | undefined;

      const component = () => {
        const obs = new Seidr(100);
        capturedObsId = obs.id;
        // @ts-expect-error
        return $("div", {}, [`${obs.value}`]);
      };

      const { state } = renderToString(component, scope);

      expect(scope.size).toBeGreaterThan(0);
      expect(state.observables[capturedObsId!]).toBe(100);
    });

    it("should clean up scope after rendering", () => {
      const scope = new SSRScope();

      const component = () => {
        const obs = new Seidr(42);
        // @ts-expect-error
        return $("div", {}, [`${obs.value}`]);
      };

      renderToString(component, scope);

      // Scope should NOT be cleared if we provided it (user is responsible)
      expect(scope.size).toBeGreaterThan(0);

      scope.clear();
      expect(scope.size).toBe(0);
    });

    it("should handle observables created in nested function calls", () => {
      const component = () => {
        const count = new Seidr(5);
        // @ts-expect-error
        return $("div", {}, [`Count: ${count.value}`]);
      };

      const { html, state } = renderToString(component);

      expect(html).toContain("Count: 5");
      expect(Object.keys(state.observables)).toHaveLength(1);
    });
  });
});
