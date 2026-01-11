import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../core/dom/component";
import { $ } from "../core/dom/element";
import { Seidr } from "../core/seidr";
import { enableClientMode } from "../test-setup";
import { hydrate, isHydrating as isHydratingFlag, resetHydratingFlag } from "./hydrate";
import { applyElementBindings, clearHydrationData, hasHydrationData, setHydrationData } from "./hydration-context";
import { renderToString } from "./render-to-string";
import { SSRScope, setActiveSSRScope } from "./ssr-scope";
import type { HydrationData } from "./types";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("Client-Side Hydration", () => {
  let cleanupClientMode: () => void;

  beforeEach(() => {
    // Ensure we're in CLIENT mode, not SSR mode
    cleanupClientMode = enableClientMode();
  });

  afterEach(() => {
    clearHydrationData();
    resetHydratingFlag();
    // Restore original environment state
    cleanupClientMode();

    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear active scope
    setActiveSSRScope(undefined);
  });

  describe("Hydration Context", () => {
    it("should be in client mode", () => {
      // Verify we're in client mode for these tests
      expect(typeof window).not.toBe("undefined");
      expect(process.env.SEIDR_TEST_SSR).toBeUndefined();
      expect((process.env as any).VITEST).toBeUndefined();
    });

    it("should track hydration state", () => {
      expect(hasHydrationData()).toBe(false);

      const data: HydrationData = {
        elementIds: [],
        observables: { 0: 42 },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      setHydrationData(data);
      expect(hasHydrationData()).toBe(true);

      clearHydrationData();
      expect(hasHydrationData()).toBe(false);
    });

    it("should clear registry when setting new context", () => {
      const data1: HydrationData = {
        elementIds: [],
        observables: { 0: "first" },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      setHydrationData(data1);

      // Create Seidr instances
      const seidr1 = new Seidr(0);
      const seidr2 = new Seidr(0);

      // Clear and set new context
      const data2: HydrationData = {
        elementIds: [],
        observables: { 0: "second" },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      setHydrationData(data2);

      // New instances should get numeric ID 0 again
      const seidr3 = new Seidr(0);

      // seidr3 should be hydrated with "second"
      expect(seidr3.value).toBe("second");
    });
  });

  describe("Seidr Registration", () => {
    it("should register Seidr instances in creation order", () => {
      const data: HydrationData = {
        elementIds: [],
        observables: { 0: 100, 1: 200 },
        bindings: {},
        graph: {
          nodes: [
            { id: 0, parents: [] },
            { id: 1, parents: [] },
          ],
          rootIds: [0, 1],
        },
      };

      setHydrationData(data);

      const seidr1 = new Seidr(0);
      const seidr2 = new Seidr(0);
      const seidr3 = new Seidr(0);

      // Values should be set based on creation order
      expect(seidr1.value).toBe(100);
      expect(seidr2.value).toBe(200);
      expect(seidr3.value).toBe(0); // No hydrated value for ID 2
    });

    it("should only hydrate root observables", () => {
      const data: HydrationData = {
        elementIds: [],
        observables: { 0: "root" },
        bindings: {},
        graph: {
          nodes: [
            { id: 0, parents: [] }, // root
            { id: 1, parents: [0] }, // derived
          ],
          rootIds: [0],
        },
      };

      setHydrationData(data);

      const root = new Seidr("");
      const derived = root.as((s) => s.toUpperCase());

      expect(root.value).toBe("root");
      expect(derived.value).toBe("ROOT"); // Derived from hydrated root
    });

    it("should work with computed observables", () => {
      const data: HydrationData = {
        elementIds: [],
        observables: {
          0: "John",
          1: "Doe",
        },
        bindings: {},
        graph: {
          nodes: [
            { id: 0, parents: [] }, // firstName
            { id: 1, parents: [] }, // lastName
            { id: 2, parents: [0, 1] }, // fullName
          ],
          rootIds: [0, 1],
        },
      };

      setHydrationData(data);

      const firstName = new Seidr("");
      const lastName = new Seidr("");
      const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

      expect(firstName.value).toBe("John");
      expect(lastName.value).toBe("Doe");
      expect(fullName.value).toBe("John Doe");
    });

    it("should not register when not hydrating", () => {
      const seidr = new Seidr(42);
      expect(seidr.value).toBe(42);
    });
  });

  describe("Element Binding Application", () => {
    it("should apply bindings for elements with data-seidr-id", () => {
      const data: HydrationData = {
        elementIds: [],
        observables: { 0: true },
        bindings: {
          "test-element": [
            {
              seidrId: 0,
              prop: "disabled",
              paths: [[]], // Empty path = is a root
            },
          ],
        },
        graph: {
          nodes: [{ id: 0, parents: [] }],
          rootIds: [0],
        },
      };

      setHydrationData(data);

      const seidr = new Seidr(false);
      const element = document.createElement("button");
      element.setAttribute("data-seidr-id", "test-element");

      // Apply bindings manually (normally done by element creation)
      applyElementBindings("test-element");

      expect(seidr.value).toBe(true);
    });

    it("should traverse paths to find root values", () => {
      const data: HydrationData = {
        elementIds: [],
        observables: { 0: "hydrated" },
        bindings: {
          "test-element": [
            {
              seidrId: 1, // derived
              prop: "textContent",
              paths: [[0]], // derived.parents[0] = root
            },
          ],
        },
        graph: {
          nodes: [
            { id: 0, parents: [] }, // root
            { id: 1, parents: [0] }, // derived
          ],
          rootIds: [0],
        },
      };

      setHydrationData(data);

      const root = new Seidr("");
      const derived = root.as((s) => s.toUpperCase());

      // Apply bindings
      applyElementBindings("test-element");

      expect(root.value).toBe("hydrated");
      expect(derived.value).toBe("HYDRATED");
    });

    it("should handle multiple paths to different roots", () => {
      const data: HydrationData = {
        elementIds: [],
        observables: {
          0: "John",
          1: "Doe",
        },
        bindings: {
          "test-element": [
            {
              seidrId: 2, // fullName (computed)
              prop: "textContent",
              paths: [
                [0], // fullName.parents[0] = firstName
                [1], // fullName.parents[1] = lastName
              ],
            },
          ],
        },
        graph: {
          nodes: [
            { id: 0, parents: [] }, // firstName
            { id: 1, parents: [] }, // lastName
            { id: 2, parents: [0, 1] }, // fullName
          ],
          rootIds: [0, 1],
        },
      };

      setHydrationData(data);

      const firstName = new Seidr("");
      const lastName = new Seidr("");
      const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

      // Apply bindings
      applyElementBindings("test-element");

      expect(firstName.value).toBe("John");
      expect(lastName.value).toBe("Doe");
      expect(fullName.value).toBe("John Doe");
    });

    it("should handle nested path traversal", () => {
      const data: HydrationData = {
        elementIds: [],
        observables: { 0: 10 },
        bindings: {
          "test-element": [
            {
              seidrId: 2, // level2 (doubled of doubled)
              prop: "textContent",
              paths: [[0, 0]], // level2.parents[0].parents[0] = root
            },
          ],
        },
        graph: {
          nodes: [
            { id: 0, parents: [] }, // root
            { id: 1, parents: [0] }, // level1
            { id: 2, parents: [1] }, // level2
          ],
          rootIds: [0],
        },
      };

      setHydrationData(data);

      const root = new Seidr(0);
      const level1 = root.as((n) => n * 2);
      const level2 = level1.as((n) => n * 2);

      // Apply bindings
      applyElementBindings("test-element");

      expect(root.value).toBe(10);
      expect(level1.value).toBe(20);
      expect(level2.value).toBe(40);
    });
  });

  describe("Integration Tests", () => {
    it("should hydrate complete component with bindings", () => {
      // Server-side data
      const data: HydrationData = {
        elementIds: [],
        observables: {
          0: "hydrated-name",
          1: true,
        },
        bindings: {
          abc123: [
            {
              seidrId: 0,
              prop: "textContent",
              paths: [[]],
            },
            {
              seidrId: 1,
              prop: "disabled",
              paths: [[]],
            },
          ],
        },
        graph: {
          nodes: [
            { id: 0, parents: [] },
            { id: 1, parents: [] },
          ],
          rootIds: [0, 1],
        },
      };

      setHydrationData(data);

      // Create component (normally would mount to DOM)
      const name = new Seidr("");
      const disabled = new Seidr(false);

      const button = $("button", {
        textContent: name,
        disabled,
      }) as HTMLButtonElement;

      // The element creation should apply bindings automatically
      // In real scenario, element would have data-seidr-id="abc123" from server HTML
      // For this test, we simulate it by setting the attribute
      button.setAttribute("data-seidr-id", "abc123");

      // Manually trigger binding application (normally done in element creation)
      applyElementBindings("abc123");

      expect(name.value).toBe("hydrated-name");
      expect(disabled.value).toBe(true);
      expect(button.textContent).toBe("hydrated-name");
      expect(button.disabled).toBe(true);
    });
  });

  describe("hydrate() function", () => {
    beforeEach(() => {
      // Enable SSR mode for these tests
      // @ts-expect-error
      process.env.SEIDR_TEST_SSR = true;
    });

    it("should restore observable values during hydration", async () => {
      const TestComponent = () =>
        component(() => {
          const count = new Seidr(42);
          return $("div", { textContent: count.as((n) => `Count: ${n}`) });
        })();

      // Server-side capture
      const scope = new SSRScope();
      setActiveSSRScope(scope);
      const { hydrationData } = await renderToString(TestComponent, undefined, scope);
      setActiveSSRScope(undefined);

      // Switch to client mode for hydration
      const cleanupClientMode2 = enableClientMode();

      // Client-side hydration
      const container = document.createElement("div");
      const hydratedComponent = hydrate(TestComponent, container, hydrationData);

      expect(hydratedComponent).toBeDefined();
      // The hydrated element should have the server-side value
      expect(String(container.textContent)).toContain("Count: 42");

      // Cleanup client mode
      cleanupClientMode2();
    });

    it("should clear hydration context after hydration", () => {
      const hydrationData: HydrationData = {
        elementIds: [],
        observables: {},
        bindings: {},
        graph: { nodes: [], rootIds: [] },
      };

      const TestComponent = () =>
        component(() => {
          return $("div", {}, ["test"]);
        })();

      expect(isHydratingFlag).toBe(false);
      expect(hasHydrationData()).toBe(false);

      // Switch to client mode for hydration
      const cleanupClientMode2 = enableClientMode();

      const container = document.createElement("div");
      hydrate(TestComponent, container, hydrationData);

      // Flag should be set after hydration starts
      expect(isHydratingFlag).toBe(true);
      // But hydration data context should be cleared
      expect(hasHydrationData()).toBe(false);

      // Cleanup client mode
      cleanupClientMode2();
    });

    it("should restore nested context after hydration", () => {
      const originalData: HydrationData = {
        elementIds: [],
        observables: { 0: 1 },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      const hydrateData: HydrationData = {
        elementIds: [],
        observables: { 0: 2 },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      setHydrationData(originalData);

      const TestComponent = () =>
        component(() => {
          return $("div", {}, ["test"]);
        })();

      // Switch to client mode for hydration
      const cleanupClientMode2 = enableClientMode();

      const container = document.createElement("div");
      hydrate(TestComponent, container, hydrateData);

      // Cleanup client mode
      cleanupClientMode2();
    });
  });
});
