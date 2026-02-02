import { JSDOM } from "jsdom";
import { beforeEach, describe, expect, it } from "vitest";
import { $query, $queryAll, component, mount } from "../src/index.browser.js";
import { Counter } from "./counter.js";

describe("Counter Example", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    document = dom.window.document;
    global.document = document;
    global.HTMLInputElement = dom.window.HTMLInputElement;
    global.HTMLButtonElement = dom.window.HTMLButtonElement;
  });

  it("should render counter with initial value of 0", async () => {
    const counterComponent = Counter();
    mount(counterComponent, document.body);

    const span = document.querySelector(".counter span");
    expect(span?.textContent).toBe("0");
  });

  it("should increment counter when increment button is clicked", async () => {
    const counterComponent = Counter();
    mount(counterComponent, document.body);

    const buttons = $queryAll<HTMLButtonElement>(".counter button");
    const incrementButton = buttons[0];
    const span = $query<HTMLSpanElement>(".counter span");

    incrementButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(span?.textContent).toBe("1");
  });

  it("should disable increment button when count reaches 10", async () => {
    const counterComponent = Counter();
    mount(counterComponent, document.body);

    const buttons = $queryAll<HTMLButtonElement>(".counter button");
    const incrementButton = buttons[0] as HTMLButtonElement;

    // Click 10 times
    for (let i = 0; i < 10; i++) {
      incrementButton.click();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(incrementButton.disabled).toBe(true);
  });

  it("should reset counter when reset button is clicked", async () => {
    const counterComponent = Counter();
    mount(counterComponent, document.body);

    const buttons = $queryAll<HTMLButtonElement>(".counter button");
    const incrementButton = buttons[0];
    const resetButton = buttons[1];
    const span = $query<HTMLSpanElement>(".counter span");

    incrementButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(span?.textContent).toBe("1");

    resetButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(span?.textContent).toBe("0");
  });

  it("should cleanup properly when destroyed", async () => {
    const counterComponent = component(Counter)();
    mount(counterComponent, document.body);

    counterComponent.element.remove();

    expect(document.body.children.length).toBe(0);
  });
});
