import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type CleanupFunction, component, mount } from "../src/index";
import { type Todo, TodoApp } from "./todo-mvc";

describe("TodoMVC", () => {
  let dom: JSDOM;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    document = dom.window.document;
    global.document = document;
    global.HTMLInputElement = dom.window.HTMLInputElement;
    global.HTMLButtonElement = dom.window.HTMLButtonElement;
    global.HTMLFormElement = dom.window.HTMLFormElement;
  });

  afterEach(() => {
    unmount?.();
  });

  it("should render  input", async () => {
    unmount = mount(TodoApp, document.body);

    const input = document.querySelector(".new-todo") as HTMLInputElement;

    expect(input?.placeholder).toBe("What needs to be done?");
  });

  it("should not render list without items", async () => {
    unmount = mount(TodoApp, document.body);

    expect(document.querySelector(".todo-list")).toBeNull();
  });

  it("should render with initial todos", async () => {
    const initialTodos: Todo[] = [
      { id: 1, title: "Learn Seidr", completed: false },
      { id: 2, title: "Build apps", completed: false },
    ];
    unmount = mount(() => TodoApp(initialTodos), document.body);

    const todoList = document.querySelector(".todo-list");
    const listItems = todoList?.querySelectorAll("li");
    expect(listItems?.length).toBe(2);
  });

  it("should cleanup properly when destroyed", async () => {
    const todoComponent = component<Todo[]>(TodoApp)([]);

    const unmount = mount(todoComponent, document.body);
    unmount();

    expect(document.body.children.length).toBe(0);
  });
});
