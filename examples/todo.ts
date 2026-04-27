import { $getById, mount } from "@fimbul-works/seidr";
import { TodoApp } from "./todo-mvc";

// Mount component only in browser environment
if (!process.env.VITEST) {
  mount(TodoApp, $getById("app")!);
}
