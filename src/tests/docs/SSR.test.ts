import { hydrate, inClient, inServer, isClient, isServer, List, Seidr } from "@fimbul-works/seidr";
import { $div, $li, $ul } from "@fimbul-works/seidr/html";
import { renderToString } from "@fimbul-works/seidr/ssr";
import { beforeEach, describe, expect, test } from "vitest";
import { enableClientMode, enableSSRMode } from "../../test-setup";

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
          List<Todo, string>(
            todos,
            (item) => item.id,
            (item: Seidr<Todo>) => $li({ textContent: item.as((v) => v.text) }),
          ),
        ]),
      ]);
    };

    const todos: Todo[] = [
      { id: "1", text: "Learn Seidr", completed: false },
      { id: "2", text: "Build an app", completed: false },
    ];

    // 1. Server-side rendering
    const cleanupSsrMode = enableSSRMode();
    const { html, hydrationData } = await renderToString(() => TodoApp(todos));
    expect(html).toContain("Learn Seidr");
    expect(html).toContain("Build an app");
    expect(hydrationData.data.state.todos).toEqual(todos);
    cleanupSsrMode();

    // 2. Client-side hydration
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const cleanupClientMode = enableClientMode();
    const unmount = hydrate(TodoApp, container, hydrationData);
    expect(container.textContent).toContain("Learn Seidr");

    // Verify interactivity
    const todosObservable = new Seidr<Todo[]>([], { id: "todos" }); // Re-accessing via ID
    expect(todosObservable.value).toEqual(todos);

    unmount();
    cleanupClientMode();
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
