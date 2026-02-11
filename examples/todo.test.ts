import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type CleanupFunction, component, mount } from "../src/index.core";
import { TodoApp } from "./todo";

describe("TODO Example", () => {
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

  it("should render form with input and button", async () => {
    unmount = mount(TodoApp, document.body);

    const form = document.querySelector(".todo-form");
    const input = document.querySelector(".todo-input") as HTMLInputElement;
    const button = document.querySelector(".btn-primary") as HTMLButtonElement;

    expect(form).not.toBeNull();
    expect(input?.placeholder).toBe("What needs to be done?");
    expect(button?.textContent).toBe("Add");
  });

  it("should render with empty todo list", async () => {
    unmount = mount(TodoApp, document.body);

    const todoList = document.querySelector(".todo-list");
    const listItems = todoList?.querySelectorAll("li");
    expect(listItems?.length).toBe(0);
  });

  it("should render with initial todos", async () => {
    const initialTodos = [
      { id: 1, text: "Learn Seidr", completed: false },
      { id: 2, text: "Build apps", completed: false },
    ];
    unmount = mount(() => TodoApp(initialTodos), document.body);

    const todoList = document.querySelector(".todo-list");
    const listItems = todoList?.querySelectorAll("li");
    expect(listItems?.length).toBe(2);
  });

  it("should cleanup properly when destroyed", async () => {
    const todoComponent = component(TodoApp)([]);

    const unmount = mount(todoComponent, document.body);
    unmount();

    expect(document.body.children.length).toBe(0);
  });
});
