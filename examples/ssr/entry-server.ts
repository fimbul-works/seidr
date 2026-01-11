import { renderToString, Seidr } from "../../src/index.node.js";
import { TodoApp } from "./app.js";
import type { Todo } from "./types.js";

export async function render(url: string, todos: Todo[] = []) {
  const state = new Seidr(todos);
  return await renderToString(TodoApp, state, {
    initialPath: url
  });
}
