import {
  $button,
  $checkbox,
  $div,
  $form,
  $h1,
  $input,
  $li,
  $span,
  $ul,
  bindInput,
  cn,
  component,
  createStateKey,
  getState,
  isUndefined,
  List,
  Seidr,
  setState,
} from "../../src/index.browser.js";
import { saveTodos } from "./todo-api.js";
import type { Todo } from "./types.js";

const todosKey = createStateKey<Seidr<Todo[]>>("todos");

function TodoItem({ todo, onDelete, saveTodos }: { todo: Todo; onDelete: () => void; saveTodos: () => void }) {
  return component(() => {
    const isCompleted = new Seidr(todo.completed);

    return $li(
      {
        className: isCompleted.as((completed) => cn("todo-item", completed && "completed")),
      },
      [
        $checkbox({
          type: "checkbox",
          checked: isCompleted,
          onchange: () => {
            isCompleted.value = !isCompleted.value;
            todo.completed = isCompleted.value;
            saveTodos();
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
  });
}

export function TodoApp(todos: Seidr<Todo[]>) {
  return component(() => {
    if (!isUndefined(todos)) {
      setState(todosKey, todos);
    } else {
      todos = getState(todosKey);
    }

    const newTodoText = new Seidr("");

    const addTodo = (e: Event) => {
      e.preventDefault();
      const text = newTodoText.value.trim();
      if (text) {
        todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
        newTodoText.value = "";
        saveTodos(todos.value)
          .then(() => console.log("Added TODO", text))
          .catch((err) => console.error(err));
      }
    };

    return $div({ className: "todo-app card" }, [
      $h1({ textContent: "TODO App" }),
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
              onDelete: () => {
                todos.value = todos.value.filter((t) => t.id !== item.id);
                saveTodos(todos.value);
              },
              saveTodos: () => saveTodos(todos.value),
            }),
        ),
      ]),
    ]);
  });
}
