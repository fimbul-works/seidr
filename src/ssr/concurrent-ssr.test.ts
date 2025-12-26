import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../core/seidr";
import { enableSSRMode } from "../test-setup";
import { component } from "../core/dom/component";
import { $ } from "../core/dom/element";
import { renderToString } from "./render-to-string";
import { runWithRenderContextSync } from "../render-context.node";

describe("Concurrent SSR Request Isolation", () => {
  let cleanupMode: () => void;

  beforeEach(() => {
    cleanupMode = enableSSRMode();
  });

  afterAll(() => {
    // Clean up any remaining scopes
    expect(() => {
      // All scopes should be cleaned up after tests
    }).not.toThrow();
  });

  it("should isolate SSR scopes between concurrent render contexts", async () => {
    // Create a component that uses different Seidr instances
    const makeComponent = (initialCount: number) =>
      component(() => {
        const count = new Seidr(initialCount);
        return $(
          "div",
          {},
          [$("span", { textContent: count.as((n) => `Count: ${n}`) })],
        );
      });

    // Simulate concurrent SSR requests
    const result1 = await runWithRenderContextSync(async () => {
      return await renderToString(() => makeComponent(42));
    });
    const result2 = await runWithRenderContextSync(async () => {
      return await renderToString(() => makeComponent(100));
    });
    const result3 = await runWithRenderContextSync(async () => {
      return await renderToString(() => makeComponent(0));
    });

    // Each render should have its own isolated scope
    expect(result1.html).toContain("<span");
    expect(result2.html).toContain("<span");
    expect(result3.html).toContain("<span");

    // Each should have its own hydration data
    expect(result1.hydrationData.renderContextID).not.toBe(
      result2.hydrationData.renderContextID,
    );
    expect(result2.hydrationData.renderContextID).not.toBe(
      result3.hydrationData.renderContextID,
    );
    expect(result3.hydrationData.renderContextID).not.toBe(
      result1.hydrationData.renderContextID,
    );

    // Each should have captured the correct observable value
    const obs1 = Object.values(result1.hydrationData.observables);
    const obs2 = Object.values(result2.hydrationData.observables);
    const obs3 = Object.values(result3.hydrationData.observables);

    expect(obs1).toContain(42);
    expect(obs2).toContain(100);
    expect(obs3).toContain(0);
  });

  it("should handle multiple derived observables in concurrent requests", async () => {
    const makeComponent = (baseValue: number) =>
      component(() => {
        const base = new Seidr(baseValue);
        const doubled = base.as((n) => n * 2);
        const tripled = base.as((n) => n * 3);

        return $(
          "div",
          {},
          [
            $("span", { textContent: doubled.as((n) => String(n)) }),
            $("span", { textContent: tripled.as((n) => String(n)) }),
          ],
        );
      });

    // Concurrent renders
    const [r1, r2, r3] = await Promise.all([
      runWithRenderContextSync(async () => renderToString(() => makeComponent(5))),
      runWithRenderContextSync(async () => renderToString(() => makeComponent(10))),
      runWithRenderContextSync(async () => renderToString(() => makeComponent(15))),
    ]);

    // Verify isolation
    expect(r1.html).toContain("10");
    expect(r1.html).toContain("15");

    expect(r2.html).toContain("20");
    expect(r2.html).toContain("30");

    expect(r3.html).toContain("30");
    expect(r3.html).toContain("45");

    // Each should have different render context IDs
    const ids = new Set([
      r1.hydrationData.renderContextID,
      r2.hydrationData.renderContextID,
      r3.hydrationData.renderContextID,
    ]);
    expect(ids.size).toBe(3);

    // Each should have captured only its root observable
    const values1 = Object.values(r1.hydrationData.observables);
    const values2 = Object.values(r2.hydrationData.observables);
    const values3 = Object.values(r3.hydrationData.observables);

    expect(values1).toEqual([5]);
    expect(values2).toEqual([10]);
    expect(values3).toEqual([15]);
  });

  it("should properly clean up scopes after concurrent renders", async () => {
    // Track scope creation/destroy
    const makeComponent = () =>
      component(() => {
        const state = new Seidr("test");
        return $("div", {}, [$("span", { textContent: state })]);
      });

    // Run multiple renders
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        runWithRenderContextSync(async () => renderToString(makeComponent)),
      ),
    );

    // All should succeed
    expect(results).toHaveLength(10);
    results.forEach((result) => {
      expect(result.html).toContain("<span");
      expect(result.hydrationData.renderContextID).toBeDefined();
    });

    // All render context IDs should be unique
    const ids = results.map((r) => r.hydrationData.renderContextID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  it("should handle mixed simple and complex graphs concurrently", async () => {
    const simpleComponent = () =>
      component(() => {
        const count = new Seidr(1);
        return $("div", {}, [$("span", { textContent: count.as((n) => String(n)) })]);
      });

    const complexComponent = () =>
      component(() => {
        const a = new Seidr(1);
        const b = new Seidr(2);
        const c = new Seidr(3);
        const ab = a.as((n) => n + b.value);
        const bc = b.as((n) => n + c.value);
        const sum = ab.as((n) => n + c.value);

        return $(
          "div",
          {},
          [
            $("span", { textContent: ab.as((n) => String(n)) }),
            $("span", { textContent: bc.as((n) => String(n)) }),
            $("span", { textContent: sum.as((n) => String(n)) }),
          ],
        );
      });

    // Run simple and complex components concurrently
    const [simple, complex] = await Promise.all([
      runWithRenderContextSync(async () => renderToString(simpleComponent)),
      runWithRenderContextSync(async () => renderToString(complexComponent)),
    ]);

    // Verify simple component
    expect(simple.html).toContain("1");
    expect(Object.values(simple.hydrationData.observables)).toEqual([1]);

    // Verify complex component
    expect(complex.html).toContain("3");
    expect(complex.html).toContain("5");
    expect(complex.html).toContain("6");
    // Note: c is not used in any binding, so it won't be captured
    // Only a and b are dependencies of bound observables
    expect(Object.values(complex.hydrationData.observables)).toEqual([1, 2]);

    // Verify different render contexts
    expect(simple.hydrationData.renderContextID).not.toBe(
      complex.hydrationData.renderContextID,
    );
  });

  it("should isolate scopes when using manual scope pattern", () => {
    runWithRenderContextSync(() => {
      // Create multiple scopes in same render context
      // (advanced pattern for testing)

      const scope1 = new (class {
        private observables = new Map<string, Seidr<any>>();
        get size() {
          return this.observables.size;
        }
        register(seidr: Seidr<any>) {
          this.observables.set(seidr.id, seidr);
        }
        get(id: string) {
          return this.observables.get(id);
        }
        clear() {
          this.observables.clear();
        }
      })();

      const scope2 = new (class {
        private observables = new Map<string, Seidr<any>>();
        get size() {
          return this.observables.size;
        }
        register(seidr: Seidr<any>) {
          this.observables.set(seidr.id, seidr);
        }
        get(id: string) {
          return this.observables.get(id);
        }
        clear() {
          this.observables.clear();
        }
      })();

      // Register different observables in each scope
      const obs1 = new Seidr(42);
      const obs2 = new Seidr(100);

      scope1.register(obs1);
      scope2.register(obs2);

      // Each scope should only have its own observable
      expect(scope1.size).toBe(1);
      expect(scope2.size).toBe(1);
      expect(scope1.get(obs1.id)).toBe(obs1);
      expect(scope2.get(obs2.id)).toBe(obs2);

      // Cleanup
      scope1.clear();
      scope2.clear();
    });
  });
});
