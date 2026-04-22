import { describe, test, expect, beforeEach } from "vitest";
import { Seidr, List, isClient, isServer, inClient, inServer } from "@fimbul-works/seidr";
import { $div, $ul, $li } from "@fimbul-works/seidr/html";
import { renderToString, hydrate } from "@fimbul-works/seidr/ssr";

describe("docs/SSR.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("SSR Quick Start - renderToString and hydrate", async () => {
    type Todo = { id: string; text: string; completed: boolean };

    const TodoApp = (initialTodos: Todo[] = []) => {
      const todos = new Seidr(initialTodos, { id: "todos" });
      return $div({ className: "todo-app" }, [
        $ul({}, [
          List<Todo>(
            todos,
            (item) => item.id,
            (item) => $li({ textContent: item.as((v) => v.text) }),
          ),
        ]),
      ]);
    };

    const todos: Todo[] = [
      { id: "1", text: "Learn Seidr", completed: false },
      { id: "2", text: "Build an app", completed: false },
    ];

    // 1. Server-side rendering
    const { html, hydrationData } = await renderToString(() => TodoApp(todos));
    expect(html).toContain("Learn Seidr");
    expect(html).toContain("Build an app");
    expect(hydrationData.data.state.todos).toEqual(todos);

    // 2. Client-side hydration
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const unmount = hydrate(TodoApp, container, hydrationData);
    expect(container.textContent).toContain("Learn Seidr");

    // Verify interactivity
    const todosObservable = new Seidr<Todo[]>([], { id: "todos" }); // Re-accessing via ID
    expect(todosObservable.value).toEqual(todos);

    unmount();
  });

  test("Environment Utilities: isClient, isServer, inClient, inServer", async () => {
    // In Vitest with jsdom, isClient is true
    expect(isClient()).toBe(true);
    expect(isServer()).toBe(false);

    let clientVal = "";
    inClient(() => {
      clientVal = "client";
    });
    expect(clientVal).toBe("client");

    let serverVal = "";
    inServer(() => {
      serverVal = "server";
    });
    expect(serverVal).toBe(""); // Should not run in client mode

    // Test inServer async
    const data = new Seidr<string | null>(null);
    await renderToString(() => {
      inServer(async () => {
        data.value = "loaded";
      });
      return $div({ textContent: data });
    });
    // Note: inServer async only works during renderToString
  });
});
