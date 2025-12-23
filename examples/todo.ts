import {
  $button,
  $checkbox,
  $div,
  $form,
  $h1el,
  $input,
  $li,
  $span,
  $ul,
  cn,
  component,
  mount,
  mountList,
  Seidr,
} from "../src";

type TodoItem = { id: string; text: string; completed: boolean };

function TodoItem({ todo, onDelete }: { todo: TodoItem; onDelete: () => void }) {
  return component((_scope) => {
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
          },
        }),
        $span({
          textContent: todo.text,
          style: isCompleted.as((completed) => (completed ? "text-decoration: line-through;" : "")),
        }),
        $button({
          textContent: "Delete",
          onclick: onDelete,
        }),
      ],
    );
  });
}

function TodoApp(initialTodos: TodoItem[] = []) {
  return component((scope) => {
    const todos = new Seidr<TodoItem[]>(initialTodos);
    const newTodoText = new Seidr("");
    const todoList = $ul({ className: "todo-list" });

    const addTodo = (e: Event) => {
      e.preventDefault();
      const text = newTodoText.value.trim();
      if (text) {
        todos.value = [...todos.value, { id: Date.now().toString(), text, completed: false }];
        newTodoText.value = "";
      }
    };

    // Use mountList for proper reactive list rendering with cleanup
    scope.track(
      mountList(
        todos,
        (item) => item.id,
        (item) =>
          TodoItem({
            todo: item,
            onDelete: () => {
              todos.value = todos.value.filter((t) => t.id !== item.id);
            },
          }),
        todoList,
      ),
    );

    return $div({ className: "todo-app" }, [
      $h1el({ textContent: "Seidr TODO App" }),
      $form({ onsubmit: addTodo, className: "todo-form" }, [
        $input({
          type: "text",
          placeholder: "What needs to be done?",
          value: newTodoText,
          className: "todo-input",
        }),
        $button({
          type: "submit",
          textContent: "Add",
          className: "todo-add-button",
        }),
      ]),
      todoList,
    ]);
  });
}

// Mount component only in browser environment (not in tests)
if (typeof document !== "undefined") {
  mount(TodoApp(), document.body);
}

export { TodoApp };
