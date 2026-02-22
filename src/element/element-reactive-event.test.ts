import { afterEach, describe, expect, it } from "vitest";
import { $button } from "../elements";
import { Seidr } from "../seidr";
import { useState } from "../state/use-state";
import { mockUseScope } from "../test-setup";
import type { CleanupFunction } from "../types";

describe("element reactive event handlers", () => {
  let cleanup: CleanupFunction;

  mockUseScope();

  afterEach(() => {
    cleanup?.();
  });

  it("should allow using reactive state within an event handler", () => {
    const [count] = useState("test-count", 0);
    const btn = $button({ textContent: count, onclick: () => (count.value = count.value + 1) });

    cleanup = count.bind(btn, (value: number, btn: HTMLButtonElement) => (btn.textContent = (value + 1).toString()));

    // Verify initial state
    expect(count.value).toBe(0);

    // Trigger click
    btn.click();

    // Verify state update
    expect(count.value).toBe(1);

    // Trigger again
    btn.click();
    expect(count.value).toBe(2);
  });

  it("should allow using reactive state for the event handler", () => {
    const [count] = useState("test-count", 0);
    const eventHandler = new Seidr<any>((ev: PointerEvent) => (ev.preventDefault(), (count.value = count.value + 1)));
    const btn = $button({ textContent: count, onclick: eventHandler });

    // Verify initial state
    expect(count.value).toBe(0);

    // Trigger click
    btn.click();

    // Verify state update
    expect(count.value).toBe(1);

    // Trigger again
    btn.click();
    expect(count.value).toBe(2);
  });
});
