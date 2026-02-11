import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../../element";
import { Seidr } from "../../seidr";
import { enableClientMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { renderToString } from "../render-to-string";
import { setSSRScope } from "../ssr-scope";
import { clearHydrationData, type HydrationData, hasHydrationData, hydrate, setHydrationData } from "./index";

describe("Hydration", () => {
  let container: HTMLElement;
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  beforeEach(() => {
    container = document.createElement("div");
    cleanupClientMode = enableClientMode();
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    cleanupClientMode();
    setSSRScope(undefined);
  });

  it("should track hydration state", () => {
    expect(hasHydrationData()).toBe(false);

    const data: HydrationData = {
      ctxID: 0,
      observables: { 0: 42 },
    };

    setHydrationData(data, container);
    expect(hasHydrationData()).toBe(true);

    clearHydrationData();
    expect(hasHydrationData()).toBe(false);
  });

  it("should clear registry when setting new context", () => {
    const data1: HydrationData = {
      ctxID: 0,
      observables: { 0: "first" },
    };

    setHydrationData(data1, container);

    // Create Seidr instances
    const _seidr1 = new Seidr(0);
    const _seidr2 = new Seidr(0);

    // Clear and set new context
    const data2: HydrationData = {
      ctxID: 1,
      observables: { 1: "second" },
    };

    setHydrationData(data2, container);

    // New instances should get numeric ID 0 again
    const seidr3 = new Seidr(0);

    // seidr3 should be hydrated with "second"
    expect(seidr3.value).toBe("second");
  });

  it("should register Seidr instances in creation order", () => {
    const data: HydrationData = {
      ctxID: 0,
      observables: { 1: 100, 2: 200 },
    };

    setHydrationData(data, container);

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
      observables: { 1: "root" },
    };

    setHydrationData(data, container);

    const root = new Seidr("");
    const derived = root.as((s) => s.toUpperCase());

    expect(root.value).toBe("root");
    expect(derived.value).toBe("ROOT"); // Derived from hydrated root
  });

  it("should work with merged observables", () => {
    const data: HydrationData = {
      ctxID: 0,
      observables: {
        1: "John",
        2: "Doe",
      },
    };

    setHydrationData(data, container);

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
    setHydrationData(
      {
        ctxID: 0,
        observables: {
          1: "hydrated-name",
          3: true,
        },
      },
      container,
    );

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
      const count = new Seidr(0);
      return $("div", { textContent: count.as((n) => `Count: ${n}`) });
    };

    unmount = hydrate(TestComponent, container, { ctxID: 0, observables: { 2: 42 } });

    expect(container.textContent).toContain("Count: 42");
  });

  it("should restore nested context after hydration", () => {
    const originalData: HydrationData = {
      ctxID: 0,
      observables: { 1: 1 },
    };

    const hydrateData: HydrationData = {
      ctxID: 0,
      observables: { 1: 2 },
    };

    setHydrationData(originalData, container);

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
});
