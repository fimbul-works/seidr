import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types.js";

const TODO_JSON = "./todos.json";

export const loadTodos = () => {
  if (!existsSync(TODO_JSON)) {
    return [];
  }

  try {
    const todos = JSON.parse(readFileSync(TODO_JSON, "utf-8"));
    // console.log("loading", todos);
    return todos;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const saveTodos = (todos: Todo[]) => {
  try {
    // console.log("saving", todos);
    writeFileSync(TODO_JSON, JSON.stringify(todos, null, 2));
  } catch (error) {
    return error instanceof Error ? error.message : error;
  }
};
