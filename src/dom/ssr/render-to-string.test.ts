import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { component } from "../component.js";
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

      const { html, state } = renderToString(() => {
        return component((_scope) => {
          const count = new Seidr(42);
          capturedCountId = count.id;
          return $("div", { className: "counter" }, [`Count: ${count.value}`]);
        });
      });

      expect(html).toContain('<div class="counter">');
      expect(html).toContain("Count: 42");
      expect(Object.keys(state.observables)).toHaveLength(1);
      expect(state.observables[capturedCountId!]).toBe(42);
    });

    it("should only capture root observable state", () => {
      let capturedIds: { count: string; doubled: string } | undefined;

      const { html, state } = renderToString(() => {
        return component((_scope) => {
          const count = new Seidr(10);
          const doubled = count.as((n) => n * 2);
          capturedIds = { count: count.id, doubled: doubled.id };

          return $("div", {}, [
            $("span", {}, [`Count: ${count.value}`]),
            $("span", {}, [`Doubled: ${doubled.value}`]),
          ]);
        });
      });

      expect(html).toContain("Count: 10");
      expect(html).toContain("Doubled: 20");
      // Only count should be in state, not doubled
      expect(Object.keys(state.observables)).toHaveLength(1);
      expect(state.observables[capturedIds!.count]).toBe(10);
      expect(state.observables[capturedIds!.doubled]).toBeUndefined();
    });

    it("should capture multiple root observables", () => {
      let capturedIds: string[] = [];

      const { html, state } = renderToString(() => {
        return component((_scope) => {
          const firstName = new Seidr("John");
          const lastName = new Seidr("Doe");
          capturedIds = [firstName.id, lastName.id];

          return $("div", {}, [$("h1", {}, [`${firstName.value} ${lastName.value}`])]);
        });
      });

      expect(html).toContain("John Doe");
      expect(Object.keys(state.observables)).toHaveLength(2);
      expect(state.observables[capturedIds[0]]).toBe("John");
      expect(state.observables[capturedIds[1]]).toBe("Doe");
    });

    it("should capture computed dependencies but not computed values", () => {
      let capturedIds: { a: string; b: string; sum: string } | undefined;

      const { html, state } = renderToString(() => {
        return component((_scope) => {
          const a = new Seidr(2);
          const b = new Seidr(3);
          const sum = Seidr.computed(() => a.value + b.value, [a, b]);
          capturedIds = { a: a.id, b: b.id, sum: sum.id };

          return $("div", {}, [`Sum: ${sum.value}`]);
        });
      });

      expect(html).toContain("Sum: 5");
      expect(Object.keys(state.observables)).toHaveLength(2);
      expect(state.observables[capturedIds!.a]).toBe(2);
      expect(state.observables[capturedIds!.b]).toBe(3);
      expect(state.observables[capturedIds!.sum]).toBeUndefined();
    });

    it("should use provided scope", () => {
      const scope = new SSRScope();
      let capturedObsId: string | undefined;

      const { state } = renderToString(
        () => {
          return component((_scope) => {
            const obs = new Seidr(100);
            capturedObsId = obs.id;
            return $("div", {}, [`${obs.value}`]);
          });
        },
        scope,
      );

      expect(scope.size).toBe(0); // scope should be cleared after captureState
      expect(state.observables[capturedObsId!]).toBe(100);
    });

    it("should clean up scope after rendering", () => {
      const scope = new SSRScope();

      renderToString(
        () => {
          return component((_scope) => {
            const obs = new Seidr(42);
            return $("div", {}, [`${obs.value}`]);
          });
        },
        scope,
      );

      // Scope SHOULD be cleared automatically by captureState() to prevent memory leaks
      expect(scope.size).toBe(0);
    });

    it("should handle observables created in nested function calls", () => {
      const { html, state } = renderToString(() => {
        return component((_scope) => {
          const count = new Seidr(5);
          return $("div", {}, [`Count: ${count.value}`]);
        });
      });

      expect(html).toContain("Count: 5");
      expect(Object.keys(state.observables)).toHaveLength(1);
    });

    it("should render TODO application", () => {
      // This test validates that proper Seidr components (using component() wrapper)
      // work correctly with SSR rendering

      const { html, state } = renderToString(() => {
        return component((_scope) => {
          const todos = new Seidr([
            { id: 1, text: "Learn Seidr", completed: false },
            { id: 2, text: "Build SSR", completed: false },
          ]);
          const newTodoText = new Seidr("");

          return $("div", { className: "todo-app" }, [
            $("h1", {}, ["TODO App"]),
            $("ul", { className: "todo-list" }, [
              $("li", {}, [
                $("input", { type: "checkbox", checked: todos.value[0].completed }),
                $("span", { textContent: todos.value[0].text }),
              ]),
              $("li", {}, [
                $("input", { type: "checkbox", checked: todos.value[1].completed }),
                $("span", { textContent: todos.value[1].text }),
              ]),
            ]),
            $("input", {
              type: "text",
              placeholder: "Add new todo",
              value: newTodoText,
            }),
          ]);
        });
      });

      // Verify HTML structure
      expect(html).toContain('<div class="todo-app">');
      expect(html).toContain("TODO App");
      expect(html).toContain('<ul class="todo-list">');
      expect(html).toContain("Learn Seidr");
      expect(html).toContain("Build SSR");
      expect(html).toContain('type="text"');
      expect(html).toContain('placeholder="Add new todo"');

      // Verify state capture - should capture 2 root observables (todos and newTodoText)
      expect(Object.keys(state.observables)).toHaveLength(2);

      // Verify the todos array was captured
      const capturedTodos = Object.values(state.observables).find(
        (val) => Array.isArray(val) && val.length === 2 && val[0]?.text === "Learn Seidr",
      );
      expect(capturedTodos).toBeDefined();
      expect(capturedTodos).toEqual([
        { id: 1, text: "Learn Seidr", completed: false },
        { id: 2, text: "Build SSR", completed: false },
      ]);
    });
  });
});
