import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createComponent } from "../component/create-component.js";
import { $div } from "../elements/index.js";
import { type CleanupFunction, hydrate } from "../index.js";
import { renderToString } from "../ssr/render-to-string.js";
import {
  enableClientMode,
  enableSSRMode,
  getAppState,
  resetNextId,
  resetRequestIdCounter,
  runWithAppState,
  setupAppState,
} from "../test-setup/index.js";
import { DATA_KEY_RANDOM, random } from "./random.js";

describe("random", () => {
  let cleanup: CleanupFunction;
  const deleteRandomData = () => getAppState().deleteData(DATA_KEY_RANDOM);

  beforeEach(() => {
    setupAppState();
    resetRequestIdCounter();
  });

  afterEach(() => {
    cleanup?.();
    deleteRandomData();
    resetNextId();
  });

  it("should return a number between 0 and 1", () => {
    cleanup = enableClientMode();

    for (let i = 0; i < 1000; i++) {
      const val = random();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("should produce different values on subsequent calls in same context", async () => {
    cleanup = enableSSRMode();

    await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      expect(r1).not.toBe(r2);
      return [];
    });
  });

  it("should produce different values on subsequent calls in different contexts", async () => {
    cleanup = enableSSRMode();

    const results1 = await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    const results2 = await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    expect(results1).not.toEqual(results2);
  });

  it("should capture random state in SSR hydrationData under 'seidr.random' and match values on client and server", async () => {
    const renderedValues: number[] = [];

    // Define component once to be used for both SSR and hydration
    const RandomApp = createComponent(() => {
      const r1 = random();
      const r2 = random();
      renderedValues.push(r1, r2);
      return $div({ className: "random-box", textContent: `${r1}-${r2}` });
    }, "RandomApp");

    // 1. Server-side render
    cleanup = enableSSRMode();
    const { html, hydrationData } = await renderToString(RandomApp);

    // Verify SSR payload captured the random state strategy explicitly under 'seidr.random'
    expect(hydrationData.data).toBeDefined();
    expect(hydrationData.data).toHaveProperty(DATA_KEY_RANDOM);
    expect(hydrationData.data[DATA_KEY_RANDOM]).toBeDefined();

    const serverR1 = renderedValues[0];
    const serverR2 = renderedValues[1];
    expect(serverR1).toBeDefined();
    expect(serverR2).toBeDefined();

    cleanup();

    // 2. Client-side hydration with the exact same component
    cleanup = enableClientMode();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    hydrate(RandomApp, container, hydrationData);

    const clientR1 = renderedValues[2];
    const clientR2 = renderedValues[3];

    expect(clientR1).toBe(serverR1);
    expect(clientR2).toBe(serverR2);

    container.remove();
  });

  it("should generate deterministic random values across nested component hierarchy using the same components", async () => {
    const recordedValues: number[] = [];

    // Define components once to be used for both SSR and hydration
    const Child = createComponent(() => {
      const r = random();
      recordedValues.push(r);
      return $div({ className: "child", textContent: String(r) });
    }, "Child");

    const Parent = createComponent(() => {
      const r = random();
      recordedValues.push(r);
      return $div({ className: "parent" }, [$div({ textContent: String(r) }), Child(), Child()]);
    }, "Parent");

    // 1. Server-side render
    cleanup = enableSSRMode();
    const { html, hydrationData } = await renderToString(Parent);

    // Verify 'seidr.random' key is stored in hydrationData.data
    expect(hydrationData.data).toHaveProperty(DATA_KEY_RANDOM);
    expect(recordedValues).toHaveLength(3);
    const serverValues = [...recordedValues];

    cleanup();

    // 2. Client-side hydration using the exact same components
    cleanup = enableClientMode();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    hydrate(Parent, container, hydrationData);

    const clientValues = recordedValues.slice(3);
    expect(clientValues).toHaveLength(3);
    expect(clientValues).toEqual(serverValues);

    container.remove();
  });
});
