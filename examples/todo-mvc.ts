import {
  inClient,
  isClient,
  List,
  createValue,
  Show,
  withStorage,
  mergeValues,
  onUnmounted,
  Value,
} from "@fimbul-works/seidr";
import {
  $a,
  $button,
  $checkbox,
  $div,
  $footer,
  $h1,
  $header,
  $input,
  $label,
  $li,
  $section,
  $span,
  $strong,
  $ul,
} from "@fimbul-works/seidr/html";

export type Todo = { id: number; title: string; completed: boolean };
export type Filter = "all" | "active" | "completed";

const ESCAPE_KEY = "Escape";
const ENTER_KEY = "Enter";

export const TodoApp = (initialTodos: Todo[] = []) => {
  // Store state in Seidr observables
  const todos = withStorage("todos", createValue<Todo[]>(initialTodos));
  const showMode = createValue<Filter>(isClient() ? (window.location.hash.slice(2) as Filter) || "all" : "all");
  const editingTodoId = createValue<number | null>(null);

  // Derived state
  const remainingCount = todos.as((list) => (Array.isArray(list) ? list.filter((t) => !t.completed).length : 0));
  const allCompleted = todos.as((list) => Array.isArray(list) && list.length > 0 && list.every((t) => t.completed));

  const filteredTodos = mergeValues(() => {
    const mode = showMode();
    const list = todos();
    if (!Array.isArray(list)) return [];
    if (mode === "active") return list.filter((t) => !t.completed);
    if (mode === "completed") return list.filter((t) => t.completed);
    return list;
  });

  // Actions
  const addTodo = (e: KeyboardEvent) => {
    const input = e.target as HTMLInputElement;
    const title = input?.value?.trim() ?? "";
    if (e.key === ENTER_KEY && title) {
      todos((prev) => [{ id: Date.now(), title, completed: false }, ...(Array.isArray(prev) ? prev : [])]);
      input.value = "";
    }
  };

  const toggleTodo = (id: number) => {
    todos((prev) =>
      Array.isArray(prev) ? prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) : [],
    );
  };

  const removeTodo = (id: number) => {
    todos((prev) => (Array.isArray(prev) ? prev.filter((t) => t.id !== id) : []));
  };

  const editTodo = (id: number, title: string) => {
    todos((prev) => (Array.isArray(prev) ? prev.map((t) => (t.id === id ? { ...t, title } : t)) : []));
    editingTodoId(null);
  };

  const clearCompleted = () => {
    todos((prev) => (Array.isArray(prev) ? prev.filter((t) => !t.completed) : []));
  };

  const toggleAll = (completed: boolean) => {
    todos((prev) => (Array.isArray(prev) ? prev.map((t) => ({ ...t, completed })) : []));
  };

  // Routing
  inClient(() => {
    const handleHashChange = () => {
      showMode((window.location.hash.slice(2) as Filter) || "all");
    };
    window.addEventListener("hashchange", handleHashChange);

    onUnmounted(() => window.removeEventListener("hashchange", handleHashChange));
  });

  // Todo Item Component (inner function to share actions)
  const TodoItem = (todo: Value<Todo>) => {
    const isEditing = editingTodoId.as((id) => id === todo()?.id);
    const isCompleted = todo.as((t) => t?.completed ?? false);
    const inputRef = createValue<HTMLInputElement | null>(null);

    isEditing.watch((editing) => {
      if (editing) {
        // Auto-focus when entering edit mode
        setTimeout(() => (inputRef() as HTMLInputElement)?.focus());
      }
    });

    return $li(
      {
        className: mergeValues(() => `todo${isCompleted() ? " completed" : ""}${isEditing() ? " editing" : ""}`),
      },
      [
        $div({ className: "view" }, [
          $checkbox({
            className: "toggle",
            checked: todo.as((t) => t.completed),
            oninput: () => toggleTodo(todo().id),
          }),
          $label({
            textContent: todo.as((t) => t.title),
            ondblclick: () => {
              editingTodoId(todo().id);
            },
          }),
          $button({
            className: "destroy",
            onclick: () => removeTodo(todo().id),
          }),
        ]),
        Show(isEditing, () =>
          $input({
            ref: inputRef,
            className: "edit",
            value: todo.as((t) => t.title),
            onblur: (e: Event) => {
              if (editingTodoId() === todo().id) {
                editTodo(todo().id, (e.target as HTMLInputElement).value.trim());
              }
            },
            onkeydown: (e: KeyboardEvent) => {
              if (e.key === ENTER_KEY) {
                editTodo(todo().id, (e.target as HTMLInputElement).value.trim());
              } else if (e.key === ESCAPE_KEY) {
                editingTodoId(null);
              }
            },
          }),
        ),
      ],
    );
  };

  return $section({ className: "todoapp" }, [
    $header({ className: "header" }, [
      $h1({ textContent: "todos" }),
      $input({
        className: "new-todo",
        placeholder: "What needs to be done?",
        onkeydown: addTodo,
        autofocus: true,
      }),
    ]),

    // Main section
    Show(
      todos.as((list) => list.length > 0),
      () =>
        $section({ className: "main" }, [
          $checkbox({
            id: "toggle-all",
            className: "toggle-all",
            checked: allCompleted,
            oninput: (e: Event) => toggleAll((e.target as HTMLInputElement).checked),
          }),
          $label({ htmlFor: "toggle-all", textContent: "Mark all as complete" }),
          $ul({ className: "todo-list" }, [List(filteredTodos, (t) => t.id, TodoItem)]),
        ]),
    ),

    // Footer
    Show(
      todos.as((list) => list.length > 0),
      () =>
        $footer({ className: "footer" }, [
          $span({ className: "todo-count" }, [
            $strong({ textContent: remainingCount.as(String) }),
            remainingCount.as<string>((count) => (count === 1 ? " item left" : " items left")),
          ]),
          $ul({ className: "filters" }, [
            $li({}, [
              $a({
                href: "#/",
                className: showMode.as<string>((m) => (m === "all" ? "selected" : "")),
                textContent: "All",
              }),
            ]),
            $li({}, [
              $a({
                href: "#/active",
                className: showMode.as<string>((m) => (m === "active" ? "selected" : "")),
                textContent: "Active",
              }),
            ]),
            $li({}, [
              $a({
                href: "#/completed",
                className: showMode.as<string>((m) => (m === "completed" ? "selected" : "")),
                textContent: "Completed",
              }),
            ]),
          ]),
          Show(
            todos.as((l) => l.some((t) => t.completed)),
            () =>
              $button({
                className: "clear-completed",
                textContent: "Clear completed",
                onclick: clearCompleted,
              }),
          ),
        ]),
    ),
  ]);
};
