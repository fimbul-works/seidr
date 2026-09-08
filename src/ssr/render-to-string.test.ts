import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodoApp } from "../../examples/todo-mvc.js";
import { createComponent } from "../component/create-component.js";
import { Suspense, type SuspenseState } from "../components/suspense.js";
import { $ } from "../element/create-element.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { createValue, mergeValues, type Value } from "../observable/value.js";
import { enableSSRMode, resetRequestIdCounter } from "../test-setup/index.js";
import { inServer } from "../util/environment/in-server.js";
import { renderToString } from "./render-to-string.js";

describe("renderToString", () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = enableSSRMode();
    resetRequestIdCounter();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render simple component and capture state", async () => {
    let count: Value<number>;

    const TestComponent = createComponent(() => {
      count = createValue(42);
      return $("div", { className: "counter", textContent: count.as((n) => `Count: ${n}`) });
    });

    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("Count: 42");
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(1);

    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
    expect(values[0]).toBe(42);
  });

  it("should only capture root observable state", async () => {
    let count: Value<number>;

    const TestComponent = createComponent(() => {
      count = createValue(10);
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
  });

  it("should capture multiple root observables", async () => {
    let firstName: Value<string>;
    let lastName: Value<string>;

    const TestComponent = createComponent(() => {
      firstName = createValue("John");
      lastName = createValue("Doe");
      const fullName = mergeValues(() => `${firstName()} ${lastName()}`, { parents: [firstName, lastName] });
      return $("div", {}, [$("h1", { textContent: fullName })]);
    });

    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("John Doe");
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(2);

    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
    expect(values).toContain("John");
    expect(values).toContain("Doe");
  });

  it("should capture merged dependencies but not merged values", async () => {
    const TestComponent = createComponent(() => {
      const a = createValue(2);
      const b = createValue(3);
      const sum = mergeValues(() => a() + b(), { parents: [a, b] });

      return $("div", { textContent: sum.as((s) => `Sum: ${s}`) });
    });

    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("Sum: 5");
    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(2);

    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
    expect(values).toContain(2);
    expect(values).toContain(3);
  });

  it("should handle a naked factory function returning a DOM node", async () => {
    const NakedFactory = () => $("span", { textContent: "Naked" });
    const { html } = await renderToString(NakedFactory);

    expect(html).toContain("<span>Naked</span>");
  });

  it("should resolve async promises with inServer", async () => {
    const TestComponent = createComponent(() => {
      const data = createValue("initial");

      inServer(async () => {
        await new Promise((resolve) => setTimeout(resolve, 15));
        data("fetched from server");
      });

      return $("div", { textContent: data });
    });

    const { html, hydrationData } = await renderToString(TestComponent);

    expect(html).toContain("fetched from server");
    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
    expect(values).toContain("fetched from server");
  });

  it("should resolve async promises with Suspense", async () => {
    const asyncPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("Async data loaded"), 15);
    });

    const TestComponent = createComponent(() => {
      return Suspense(asyncPromise, ({ state, value }: SuspenseState<string>) => {
        return $("div", {
          textContent: value.as((v) => v ?? "loading..."),
        });
      });
    });

    const { html } = await renderToString(TestComponent);

    expect(html).toContain("Async data loaded");
  });

  it("should render TODO application", async () => {
    const { html, hydrationData } = await renderToString(() =>
      TodoApp([{ id: 1, title: "Test Todo", completed: false }]),
    );

    expect(html).toContain('class="todoapp"');
    expect(html).toContain('class="todo-list"');
    expect(html).toContain('placeholder="What needs to be done?"');
    expect(html).toContain("Test Todo");

    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!).length).toBeGreaterThan(0);
  });
});
