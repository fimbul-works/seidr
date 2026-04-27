import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodoApp } from "../../examples/todo-mvc";
import { component } from "../component";
import { $ } from "../element";
import { DATA_KEY_STATE } from "../seidr/constants";
import { Seidr } from "../seidr/seidr";
import { enableSSRMode, resetRequestIdCounter } from "../test-setup";
import { renderToString } from "./render-to-string";

describe("renderToString", () => {
  let observables: Seidr[] = [];
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = enableSSRMode();
    resetRequestIdCounter();
    observables = [];
  });

  afterEach(() => {
    // Restore original environment
    cleanup();

    // Verify all observables have zero observers after SSR
    observables.forEach((obs) => {
      obs.destroy();
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
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(1);

    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
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
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(1);
    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
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
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(2);

    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
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
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(2);
    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
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
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(1);
  });

  it("should render TODO application", async () => {
    const { html, hydrationData } = await renderToString(() =>
      TodoApp([{ id: 1, title: "Test Todo", completed: false }]),
    );

    // Verify HTML structure (data-seidr-id is added automatically)
    expect(html).toContain('class="todoapp"');
    expect(html).toContain('<ul class="todo-list">');
    expect(html).toContain('placeholder="What needs to be done?"');
    expect(html).toContain("Test Todo");

    // Verify observables were captured
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!).length).toBeGreaterThan(0);
  });

  it("should handle a naked factory function returning a DOM node", async () => {
    const NakedFactory = () => $("span", { textContent: "Naked" });
    const { html } = await renderToString(NakedFactory);

    expect(html).toMatch(/data-seidr-root="\d+"/);
    expect(html).toContain("Naked");
  });
});
