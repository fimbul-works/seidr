import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";

describe("TODO Example", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    // @ts-ignore - provide document for the example
    global.document = document;
    global.HTMLInputElement = dom.window.HTMLInputElement;
    global.HTMLButtonElement = dom.window.HTMLButtonElement;
    global.HTMLFormElement = dom.window.HTMLFormElement;
  });

  it("should render TODO app with title", async () => {
    const { TodoApp } = await import("./todo.ts");
    const todoComponent = TodoApp([]);
    document.body.appendChild(todoComponent.element);

    const h1 = document.querySelector(".todo-app h1");
    expect(h1?.textContent).toBe("Seidr TODO App");
  });

  it("should render form with input and button", async () => {
    const { TodoApp } = await import("./todo.ts");
    const todoComponent = TodoApp([]);
    document.body.appendChild(todoComponent.element);

    const form = document.querySelector(".todo-form");
    const input = document.querySelector(".todo-input") as HTMLInputElement;
    const button = document.querySelector(".todo-add-button") as HTMLButtonElement;

    expect(form).not.toBeNull();
    expect(input?.placeholder).toBe("What needs to be done?");
    expect(button?.textContent).toBe("Add");
  });

  it("should render with empty todo list", async () => {
    const { TodoApp } = await import("./todo.ts");
    const todoComponent = TodoApp([]);
    document.body.appendChild(todoComponent.element);

    const todoList = document.querySelector(".todo-list");
    expect(todoList?.children.length).toBe(0);
  });

  it("should render with initial todos", async () => {
    const { TodoApp } = await import("./todo.ts");
    const initialTodos = [
      { id: "1", text: "Learn Seidr", completed: false },
      { id: "2", text: "Build apps", completed: false },
    ];
    const todoComponent = TodoApp(initialTodos);
    document.body.appendChild(todoComponent.element);

    const todoList = document.querySelector(".todo-list");
    expect(todoList?.children.length).toBe(2);
  });

  it("should cleanup properly when destroyed", async () => {
    const { TodoApp } = await import("./todo.ts");
    const todoComponent = TodoApp([]);
    document.body.appendChild(todoComponent.element);

    todoComponent.element.destroy();

    expect(document.body.children.length).toBe(0);
  });
});
