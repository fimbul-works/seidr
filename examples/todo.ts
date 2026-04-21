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
} from "../src/elements/index";
import { $getById, List, mount, Seidr, Show, useScope } from "../src/index";
import { withStorage } from "../src/seidr/with-storage.js";

export type Todo = { id: number; title: string; completed: boolean };
export type Filter = "all" | "active" | "completed";

const ESCAPE_KEY = "Escape";
const ENTER_KEY = "Enter";

export const TodoApp = (initialTodos: Todo[] = []) => {
  // Store state in Seidr observables
  const todos = withStorage("todos", new Seidr<Todo[]>(initialTodos));
  const showMode = new Seidr<Filter>((window.location.hash.slice(2) as Filter) || "all");
  const editingTodoId = new Seidr<number | null>(null);

  // Derived state
  const remainingCount = todos.as((list) => list.filter((t) => !t.completed).length);
  const allCompleted = todos.as((list) => list.length > 0 && list.every((t) => t.completed));

  const filteredTodos = Seidr.merge(() => {
    const mode = showMode.value;
    const list = todos.value;
    if (mode === "active") return list.filter((t) => !t.completed);
    if (mode === "completed") return list.filter((t) => t.completed);
    return list;
  }, [todos, showMode]);

  // Actions
  const addTodo = (e: KeyboardEvent) => {
    const input = e.target as HTMLInputElement;
    const title = input.value.trim();
    if (e.key === ENTER_KEY && title) {
      todos.value = [{ id: Date.now(), title, completed: false }, ...todos.value];
      input.value = "";
    }
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter((t) => t.id !== id);
  };

  const editTodo = (id: number, title: string) => {
    todos.value = todos.value.map((t) => (t.id === id ? { ...t, title } : t));
    editingTodoId.value = null;
  };

  const clearCompleted = () => {
    todos.value = todos.value.filter((t) => !t.completed);
  };

  const toggleAll = (completed: boolean) => {
    todos.value = todos.value.map((t) => ({ ...t, completed }));
  };

  // Routing
  const handleHashChange = () => {
    showMode.value = (window.location.hash.slice(2) as Filter) || "all";
  };
  window.addEventListener("hashchange", handleHashChange);

  const scope = useScope();
  scope.onUnmount(() => window.removeEventListener("hashchange", handleHashChange));

  // Todo Item Component (inner function to share actions)
  const TodoItem = (todo: Seidr<Todo>) => {
    const isEditing = editingTodoId.as((id) => id === todo.value.id);
    const inputRef = new Seidr<HTMLInputElement | null>(null);

    isEditing.observe((editing) => {
      if (editing) {
        // Auto-focus when entering edit mode
        setTimeout(() => (inputRef.value as HTMLInputElement)?.focus());
      }
    });

    return $li(
      {
        className: Seidr.merge(
          () => `todo${todo.as((t) => (t.completed ? " completed" : "")).value}${isEditing.value ? " editing" : ""}`,
          [todo, isEditing],
        ),
      },
      [
        $div({ className: "view" }, [
          $checkbox({
            className: "toggle",
            checked: todo.as((t) => t.completed),
            oninput: () => toggleTodo(todo.value.id),
          }),
          $label({
            textContent: todo.as((t) => t.title),
            ondblclick: () => {
              editingTodoId.value = todo.value.id;
            },
          }),
          $button({
            className: "destroy",
            onclick: () => removeTodo(todo.value.id),
          }),
        ]),
        Show(isEditing, () =>
          $input({
            ref: inputRef,
            className: "edit",
            value: todo.as((t) => t.title),
            onblur: (e: Event) => {
              if (editingTodoId.value === todo.value.id) {
                editTodo(todo.value.id, (e.target as HTMLInputElement).value.trim());
              }
            },
            onkeydown: (e: KeyboardEvent) => {
              if (e.key === ENTER_KEY) {
                editTodo(todo.value.id, (e.target as HTMLInputElement).value.trim());
              } else if (e.key === ESCAPE_KEY) {
                editingTodoId.value = null;
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

// Mount component only in browser environment
if (!process.env.VITEST) {
  mount(TodoApp, $getById("app")!);
}
