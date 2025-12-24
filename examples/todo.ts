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

type Todo = { id: number; text: string; completed: boolean };

function TodoItem({ todo, onDelete }: { todo: Todo; onDelete: () => void }) {
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
        }),
        $button({
          textContent: "Delete",
          onclick: onDelete,
        }),
      ],
    );
  });
}

function TodoApp(initialTodos: Todo[] = [{ id: Date.now(), text: "Learn Seidr", completed: false }]) {
  return component((scope) => {
    const todos = new Seidr<Todo[]>(initialTodos);
    const newTodoText = new Seidr("");
    const todoList = $ul({ className: "todo-list" });

    const addTodo = (e: Event) => {
      e.preventDefault();
      const text = newTodoText.value.trim();
      if (text) {
        todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
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
      $h1el({ textContent: "TODO App" }),
      $form({ className: "todo-form" }, [
        $input({
          type: "text",
          placeholder: "What needs to be done?",
          className: "todo-input",
          value: newTodoText, // Bind value with Seidr
          oninput: (e: Event) => {
            newTodoText.value = (e.target as HTMLInputElement).value; // And update value to complete two-way binding!
          },
        }),
        $button({
          type: "submit",
          textContent: "Add",
          className: "todo-add-button",
          onclick: addTodo,
        }),
      ]),
      todoList,
    ]);
  });
}

// Mount component only in browser environment (not in tests)
if (typeof window !== "undefined") {
  mount(TodoApp(), document.body);
}

export { TodoApp };
