import { renderToString, type SSRRenderResult } from "@fimbul-works/seidr/ssr";
import { TodoApp } from "../todo-mvc.js";

export function render(): Promise<SSRRenderResult> {
  return renderToString(TodoApp);
}
