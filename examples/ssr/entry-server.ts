import { renderToString } from "../../src/index.node.js";
import { TodoApp } from "./app.js";
import type { Todo } from "./types.js";

export async function render(_url: string, todos: Todo[] = []) {
  return await renderToString(TodoApp, todos);
}
