import {
  $button,
  $checkbox,
  $div,
  $form,
  $input,
  $li,
  $span,
  $ul,
  bindInput,
  cn,
  component,
  List,
  mount,
  Seidr,
  withStorage,
} from "../src/index.browser.js";

type Todo = { id: number; text: string; completed: boolean };

const TodoItem = component(
  ({ todo, onUpdate, onDelete }: { todo: Todo; onUpdate: () => void; onDelete: () => void }) => {
    const isCompleted = new Seidr(todo.completed);

    return $li(
      {
        className: isCompleted.as((completed) => cn("todo-item", completed && "completed")),
      },
      [
        $checkbox({
          checked: isCompleted,
          onchange: () => {
            isCompleted.value = !isCompleted.value;
            todo.completed = isCompleted.value;
            onUpdate();
          },
        }),
        $span({
          textContent: todo.text,
        }),
        $button({
          className: "btn btn-danger",
          textContent: "Delete",
          onclick: onDelete,
        }),
      ],
    );
  },
);

export const TodoApp = component((initialTodos: Todo[]) => {
  const todos = withStorage(
    "todos",
    new Seidr<Todo[]>(initialTodos || [{ id: Date.now(), text: "Learn Seidr", completed: false }]),
  );
  const newTodoText = new Seidr("");

  const addTodo = (e: Event) => {
    e.preventDefault();
    const text = newTodoText.value.trim();
    if (text) {
      todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
      newTodoText.value = "";
    }
  };

  return $div({ className: "todo-app card" }, [
    $form({ className: "todo-form" }, [
      $input({
        type: "text",
        placeholder: "What needs to be done?",
        className: "todo-input",
        ...bindInput(newTodoText),
      }),
      $button({
        type: "submit",
        textContent: "Add",
        className: "btn btn-primary",
        onclick: addTodo,
      }),
    ]),
    $ul({ className: "todo-list" }, [
      List(
        todos,
        (item) => item.id,
        (item) =>
          TodoItem({
            todo: item,
            onUpdate() {
              todos.value = todos.value.slice(0);
            },
            onDelete() {
              todos.value = todos.value.filter((t) => t.id !== item.id);
            },
          }),
      ),
    ]),
  ]);
});

// Mount component only in browser environment (not in tests)
if (typeof window !== "undefined") {
  mount(TodoApp([]), document.body);
}
