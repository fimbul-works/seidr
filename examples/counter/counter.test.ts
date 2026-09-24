import { afterEach, describe, expect, it } from "vitest";
import { $query, $queryAll, type CleanupFunction, createComponent, mount } from "../../src/index";
import { Counter } from "./counter";

describe("Counter Example", () => {
  let unmount: CleanupFunction;

  afterEach(() => {
    unmount?.();
  });

  it("should render counter with initial value of 0", async () => {
    unmount = mount(Counter, document.body);

    const display = document.querySelector(".counter .number-display");
    expect(display?.textContent).toBe("0");
  });

  it("should increment counter when increment button is clicked", async () => {
    unmount = mount(Counter, document.body);

    const buttons = $queryAll<HTMLButtonElement>(".counter button");
    const incrementButton = buttons[0];
    const display = $query<HTMLElement>(".counter .number-display");

    incrementButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(display?.textContent).toBe("1");
  });

  it("should disable increment button when count reaches 10", async () => {
    unmount = mount(Counter, document.body);

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
    unmount = mount(Counter, document.body);

    const buttons = $queryAll<HTMLButtonElement>(".counter button");
    const incrementButton = buttons[0];
    const resetButton = buttons[1];
    const display = $query<HTMLElement>(".counter .number-display");

    incrementButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(display?.textContent).toBe("1");

    resetButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(display?.textContent).toBe("0");
  });

  it("should cleanup properly when destroyed", async () => {
    const counterComponent = createComponent(Counter);
    const unmount = mount(counterComponent, document.body);

    unmount();

    expect(document.body.children.length).toBe(0);
  });
});
