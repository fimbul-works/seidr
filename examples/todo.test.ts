import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type CleanupFunction, createComponent, mount } from "../src/index";
import { clearTestAppState } from "../src/test-setup/index.js";
import { type Todo, TodoApp } from "./todo-mvc";

describe("TodoMVC", () => {
  let dom: JSDOM;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost" });
    document = dom.window.document;
    global.document = document;
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.localStorage = dom.window.localStorage;
    global.HTMLInputElement = dom.window.HTMLInputElement;
    global.HTMLButtonElement = dom.window.HTMLButtonElement;
    global.HTMLFormElement = dom.window.HTMLFormElement;
    dom.window.localStorage.clear();
    clearTestAppState();
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

  it("should add and toggle todos dynamically", async () => {
    unmount = mount(TodoApp, document.body);

    const input = document.querySelector(".new-todo") as HTMLInputElement;
    input.value = "New Item";
    (input as any).onkeydown?.({ target: input, key: "Enter" });

    const todoList = document.querySelector(".todo-list");
    expect(todoList).not.toBeNull();
    const items = todoList?.querySelectorAll("li");
    expect(items?.length).toBe(1);
    expect(items?.[0].textContent).toContain("New Item");

    const checkbox = items?.[0].querySelector(".toggle") as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new dom.window.Event("input"));

    expect(items?.[0].className).toContain("completed");
  });
});

