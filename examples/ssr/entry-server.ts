import { renderToString, Seidr } from "../../src/index.node.js";
import { TodoApp } from "./app.js";
import type { Todo } from "./types.js";

export async function render(path: string, todos: Todo[] = []) {
  return await renderToString(() => TodoApp(new Seidr(todos)), {
    path,
  });
}
