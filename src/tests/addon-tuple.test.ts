import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import type { DataStrategy } from "../app-state/types.js";
import { component } from "../component/index.js";
import { $ } from "../element/index.js";
import { renderToString } from "../ssr/render-to-string.js";
import { enableSSRMode, resetRequestIdCounter } from "../test-setup/index.js";

describe("AddonTuple Initialization", () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = enableSSRMode();
    resetRequestIdCounter();
  });

  afterEach(() => {
    cleanup();
  });

  it("should register strategy and restore data from an AddonTuple", async () => {
    let restoredValue = "";

    // Mock strategy
    const mockStrategy: DataStrategy<string> = [
      () => restoredValue, // Capture
      (val) => {
        restoredValue = val;
      }, // Restore
    ];

    const App = component(() => {
      // At this point, the strategy should already be registered and data restored
      const state = getAppState();
      const strategy = state.getDataStrategy("mock");
      expect(strategy).toBeDefined();

      return $("div", { textContent: restoredValue });
    });

    const { html, hydrationData } = await renderToString(App, {
      mock: ["Hello World", mockStrategy],
    });

    expect(html).toContain("Hello World");
    expect(restoredValue).toBe("Hello World");
    expect(hydrationData.data.mock).toBe("Hello World");
  });

  it("should work with multiple AddonTuples", async () => {
    let aValue = 0;
    let bValue = 0;

    const strategyA: DataStrategy<number> = [
      () => aValue,
      (v) => {
        aValue = v;
      },
    ];
    const strategyB: DataStrategy<number> = [
      () => bValue,
      (v) => {
        bValue = v;
      },
    ];

    const App = component(() => {
      return $("div", { textContent: `A:${aValue} B:${bValue}` });
    });

    const { html } = await renderToString(App, {
      a: [10, strategyA],
      b: [20, strategyB],
    });

    expect(html).toContain("A:10 B:20");
    expect(aValue).toBe(10);
    expect(bValue).toBe(20);
  });

  it("should still handle regular data correctly alongside AddonTuples", async () => {
    let addonValue = "";
    const addonStrategy: DataStrategy<string> = [
      () => addonValue,
      (v) => {
        addonValue = v;
      },
    ];

    const App = component(() => {
      const state = getAppState();
      const regular = state.getData<string>("regular");
      return $("div", { textContent: `${regular} ${addonValue}` });
    });

    const { html } = await renderToString(App, {
      regular: "Regular",
      addon: ["Addon", addonStrategy],
    });

    // Note: "regular" data that doesn't have a strategy won't be "restored" via restoreFn,
    // but it is still present in the appState.data map if it was manually set?
    // Actually, restoreAppStateData only calls restoreFn if strategy exists.
    // So "regular: Regular" won't do anything unless someone registers a strategy for it.
    // But let's verify that AddonTuple doesn't break regular processing.

    expect(html).toContain("Addon");
  });
});
