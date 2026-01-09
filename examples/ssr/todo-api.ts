import type { Todo } from "./types";

export const loadTodos = async () => {
  const res = await fetch("/api/todos");
  const json = await res.json();

  if (json.error) {
    console.log("Error", json.error);
    return [];
  }

  return json;
};

export const saveTodos = async (todos: Todo[]) => {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todos),
  });
  const json = await res.json();

  if (json.error) {
    console.log("Error", json.error);
    return false;
  }

  return true;
};
