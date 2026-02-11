import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodoApp } from "../../examples/todo";
import { component } from "../component";
import { $ } from "../element";
import { resetRequestIdCounter } from "../render-context/render-context.node";
import { Seidr } from "../seidr";
import { enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { clearHydrationData } from "./hydrate/clear-hydration-data";
import { renderToString } from "./render-to-string";
import { setSSRScope } from "./ssr-scope";

describe("renderToString", () => {
  let observables: Seidr[] = [];
  let cleanupEnv: CleanupFunction;

  beforeEach(() => {
    // Enable SSR mode for all tests
    cleanupEnv = enableSSRMode();
    resetRequestIdCounter();
    observables = [];
  });

  afterEach(() => {
    // Use active context for cleanup if possible
    setSSRScope(undefined);

    // Restore original environment
    cleanupEnv();

    // Clear hydration context
    clearHydrationData();

    // Verify all observables have zero observers after SSR
    observables.forEach((obs) => {
      expect(obs.observerCount()).toBe(0);
    });
  });

  it("should render simple component and capture state", async () => {
    let count: Seidr<number>;

    const TestComponent = component(() => {
      count = new Seidr(42);
      observables.push(count);
      return $("div", { className: "counter", textContent: count.as((n) => `Count: ${n}`) });
    });

    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("Count: 42");
    expect(Object.keys(hydrationData.observables)).toHaveLength(1);

    const values = Object.values(hydrationData.observables);
    expect(values[0]).toBe(42);
    expect(count!.observerCount()).toBe(0);
  });

  it("should only capture root observable state", async () => {
    let count: Seidr<number>;
    const TestComponent = component(() => {
      count = new Seidr(10);
      observables.push(count);
      const doubled = count.as((n) => n * 2);

      return $("div", {}, [
        $("span", { textContent: count.as((n) => `Count: ${n}`) }),
        $("span", { textContent: doubled.as((n) => `Doubled: ${n}`) }),
      ]);
    });
    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("Count: 10");
    expect(html).toContain("Doubled: 20");
    expect(Object.keys(hydrationData.observables)).toHaveLength(1);
    const values = Object.values(hydrationData.observables);
    expect(values[0]).toBe(10);
    expect(count!.observerCount()).toBe(0);
  });

  it("should capture multiple root observables", async () => {
    let firstName: Seidr<string>;
    let lastName: Seidr<string>;

    const TestComponent = component(() => {
      firstName = new Seidr("John");
      lastName = new Seidr("Doe");
      observables.push(firstName, lastName);
      const fullName = Seidr.merge(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);
      return $("div", {}, [$("h1", { textContent: fullName })]);
    });

    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("John Doe");
    expect(Object.keys(hydrationData.observables)).toHaveLength(2);

    const values = Object.values(hydrationData.observables);
    expect(values[0]).toBe("John");
    expect(values[1]).toBe("Doe");

    expect(firstName!.observerCount()).toBe(0);
    expect(lastName!.observerCount()).toBe(0);
  });

  it("should capture merged dependencies but not merged values", async () => {
    const TestComponent = component(() => {
      const a = new Seidr(2);
      const b = new Seidr(3);
      const sum = Seidr.merge(() => a.value + b.value, [a, b]);

      return $("div", { textContent: sum.as((s) => `Sum: ${s}`) });
    });
    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("Sum: 5");
    // Both a and b should be in observables, not sum (merged)
    expect(Object.keys(hydrationData.observables)).toHaveLength(2);
    const values = Object.values(hydrationData.observables);
    expect(values[0]).toBe(2);
    expect(values[1]).toBe(3);
  });

  it("should handle observables created in nested function calls", async () => {
    const TestComponent = component(() => {
      const count = new Seidr(5);
      return $("div", { textContent: count.as((n) => `Count: ${n}`) });
    });
    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("Count: 5");
    expect(Object.keys(hydrationData.observables)).toHaveLength(1);
  });

  it("should render TODO application", async () => {
    const { html, hydrationData } = await renderToString(TodoApp);

    // Verify HTML structure (data-seidr-id is added automatically)
    expect(html).toContain('class="todo-app card"');
    expect(html).toContain("data-seidr-id=");
    expect(html).toContain('<ul class="todo-list">');
    expect(html).toContain('placeholder="What needs to be done?"');

    // Verify observables were captured
    expect(Object.keys(hydrationData.observables).length).toBeGreaterThan(0);
  });
});
