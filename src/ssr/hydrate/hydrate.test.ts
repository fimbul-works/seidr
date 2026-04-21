import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $ } from "../../element";
import { DATA_KEY_STATE } from "../../seidr/constants";
import { registerStateStrategy } from "../../seidr/register-state-strategy";
import { Seidr } from "../../seidr/seidr";
import { enableClientMode, getAppState } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { renderToString } from "../render-to-string";
import { setSSRScope } from "../ssr-scope";
import type { HydrationData } from "../types";
import { clearHydrationData, hydrate, initHydrationData, isHydrating } from "./index";

describe("Hydration", () => {
  let container: HTMLElement;
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  beforeEach(() => {
    container = document.createElement("div");
    cleanupClientMode = enableClientMode();

    // Register data strategy
    const appState = getAppState();
    registerStateStrategy(appState);
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    cleanupClientMode();
    setSSRScope(undefined);
  });

  it("should track hydration state", () => {
    expect(isHydrating()).toBe(false);

    const data = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { 0: 42 } },
      components: {},
    };

    initHydrationData(data);
    expect(isHydrating()).toBe(true);

    clearHydrationData();
    expect(isHydrating()).toBe(false);
  });

  it("should clear registry when setting new context", () => {
    const data1: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { a: "first" } },
      components: {},
    };

    initHydrationData(data1);

    // Create Seidr instances
    const _seidr1 = new Seidr(0, { id: "a" });
    const _seidr2 = new Seidr(0, { id: "b" });

    // Clear and set new context
    const data2: HydrationData = {
      ctxID: 1,
      data: { [DATA_KEY_STATE]: { c: "second" } },
      components: {},
    };

    initHydrationData(data2);

    // New instances should get numeric ID 0 again
    const seidr3 = new Seidr(0, { id: "c" });

    // seidr3 should be hydrated with "second"
    expect(seidr3.value).toBe("second");
  });

  it("should register Seidr instances in creation order", () => {
    const data: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { 0: 100, 1: 200 } },
      components: {},
    };

    initHydrationData(data);

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
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { 0: "root" } },
      components: {},
    };

    initHydrationData(data);

    const root = new Seidr("");
    const derived = root.as((s) => s.toUpperCase());

    expect(root.value).toBe("root");
    expect(derived.value).toBe("ROOT"); // Derived from hydrated root
  });

  it("should work with merged observables", () => {
    const data: HydrationData = {
      ctxID: 0,
      data: {
        [DATA_KEY_STATE]: {
          0: "John",
          1: "Doe",
        },
      },
      components: {},
    };

    initHydrationData(data);

    const firstName = new Seidr("");
    const lastName = new Seidr("");
    const fullName = Seidr.merge(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

    expect(firstName.value).toBe("John");
    expect(lastName.value).toBe("Doe");
    expect(fullName.value).toBe("John Doe");
  });

  it("should not register when not hydrating", () => {
    const seidr = new Seidr(42);
    expect(seidr.value).toBe(42);
  });

  it("should hydrate complete component with bindings", () => {
    initHydrationData({
      ctxID: 0,
      data: {
        [DATA_KEY_STATE]: {
          0: "hydrated-name",
          2: true,
        },
      },
      components: {},
    });

    // Create component (normally would mount to DOM)
    const name = new Seidr("");
    const derived = name.as((s) => s.toUpperCase());
    const disabled = new Seidr(false);

    const button = $("button", {
      textContent: derived,
      disabled,
    }) as HTMLButtonElement;

    expect(name.value).toBe("hydrated-name");
    expect(disabled.value).toBe(true);
    expect(button.textContent).toBe("HYDRATED-NAME");
    expect(button.disabled).toBe(true);
  });

  it("should restore observable values during hydration", () => {
    const TestComponent = () => {
      const count = new Seidr(0, { id: "test" });
      return $("div", { textContent: count.as((n) => `Count: ${n}`) });
    };

    unmount = hydrate(TestComponent, container, {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { test: 42 } },
      components: {},
    });

    expect(container.textContent).toContain("Count: 42");
  });

  it("should restore nested context after hydration", () => {
    const originalData: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { 1: 1 } },
      components: {},
    };

    const hydrateData: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { 1: 2 } },
      components: {},
    };

    initHydrationData(originalData);

    const TestComponent = () => $("div", {}, ["test"]);

    const cleanupClientMode2 = enableClientMode();

    unmount = hydrate(TestComponent, container, hydrateData);
    cleanupClientMode2();
  });

  it("should support hydrating raw function components", async () => {
    const RawComponent = () => $("div", { textContent: "raw function" });

    const { hydrationData } = await renderToString(RawComponent);

    const cleanupClientMode2 = enableClientMode();

    unmount = hydrate(RawComponent, container, hydrationData);

    expect(container.textContent).toBe("raw function");

    cleanupClientMode2();
  });

  describe("Resilience & Fallbacks", () => {
    it("should fallback to mount when hydration is already active", () => {
      const data: HydrationData = { ctxID: 0, data: {}, components: {} };
      initHydrationData(data);

      const TestComp = () => $("div", { textContent: "fallback" });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Calling hydrate while isHydrating() is true triggers the error then fallback
      unmount = hydrate(TestComp, container, data);

      expect(consoleSpy).toHaveBeenCalledWith("Hydration failed", expect.any(Error));
      expect(container.textContent).toBe("fallback");
      consoleSpy.mockRestore();
    });

    it("should fallback to mount when ctxID is missing", () => {
      const data = { data: {}, components: {} } as any;
      const TestComp = () => $("div", { textContent: "missing-id" });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      unmount = hydrate(TestComp, container, data);

      expect(consoleSpy).toHaveBeenCalledWith("Hydration failed", expect.any(Error));
      expect(container.textContent).toBe("missing-id");
      consoleSpy.mockRestore();
    });

    it("should fallback to mount when SEIDR_ENABLE_SSR is disabled", () => {
      const original = process.env.SEIDR_ENABLE_SSR;
      delete process.env.SEIDR_ENABLE_SSR;

      const data: HydrationData = { ctxID: 0, data: {}, components: {} };
      const TestComp = () => $("div", { textContent: "no-ssr" });

      unmount = hydrate(TestComp, container, data);

      expect(container.textContent).toBe("no-ssr");
      process.env.SEIDR_ENABLE_SSR = original;
    });
  });
});
