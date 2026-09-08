import { $getById, mount } from "../src/index";
import { TodoApp } from "./todo-mvc";

// Mount component only in browser environment
if (!process.env.VITEST) {
  mount(TodoApp, $getById("app")!);
}
