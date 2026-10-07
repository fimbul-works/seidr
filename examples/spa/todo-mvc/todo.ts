import { $getById, mount } from "@fimbul-works/seidr";
import { TodoApp } from "./todo-mvc";

// Mount component
mount(
  () =>
    TodoApp([
      { id: Date.now() - 1000, title: "View Seidr example apps", completed: true },
      { id: Date.now(), title: "Check out the Seidr API documentation", completed: false },
    ]),
  $getById("app")!,
);
