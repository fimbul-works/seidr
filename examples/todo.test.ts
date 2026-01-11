import { JSDOM } from "jsdom";
import { beforeEach, describe, expect, it } from "vitest";
import { TodoApp } from "./todo.ts";

describe("TODO Example", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    document = dom.window.document;
    global.document = document;
    global.HTMLInputElement = dom.window.HTMLInputElement;
    global.HTMLButtonElement = dom.window.HTMLButtonElement;
    global.HTMLFormElement = dom.window.HTMLFormElement;
  });

  it("should render form with input and button", async () => {
    const todoComponent = TodoApp([]);
    document.body.appendChild(todoComponent.element);

    const form = document.querySelector(".todo-form");
    const input = document.querySelector(".todo-input") as HTMLInputElement;
    const button = document.querySelector(".btn-primary") as HTMLButtonElement;

    expect(form).not.toBeNull();
    expect(input?.placeholder).toBe("What needs to be done?");
    expect(button?.textContent).toBe("Add");
  });

  it("should render with empty todo list", async () => {
    const todoComponent = TodoApp([]);
    document.body.appendChild(todoComponent.element);

    const todoList = document.querySelector(".todo-list");
    // List component uses a comment marker node (in childNodes, not children)
    expect(todoList?.childNodes.length).toBe(1);
    // Check that it's a comment node (the marker)
    expect(todoList?.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
    // No actual todo items
    const listItems = todoList?.querySelectorAll("li");
    expect(listItems?.length).toBe(0);
  });

  it("should render with initial todos", async () => {
    const initialTodos = [
      { id: 1, text: "Learn Seidr", completed: false },
      { id: 2, text: "Build apps", completed: false },
    ];
    const todoComponent = TodoApp(initialTodos);
    document.body.appendChild(todoComponent.element);

    const todoList = document.querySelector(".todo-list");
    // 2 todo items + 1 marker comment node = 3 childNodes
    expect(todoList?.childNodes.length).toBe(3);
    // Count actual list items (not the marker)
    const listItems = todoList?.querySelectorAll("li");
    expect(listItems?.length).toBe(2);
  });

  it("should cleanup properly when destroyed", async () => {
    const todoComponent = TodoApp([]);
    document.body.appendChild(todoComponent.element);

    todoComponent.destroy();

    expect(document.body.children.length).toBe(0);
  });
});
