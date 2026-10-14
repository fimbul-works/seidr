import { createComponent, createRef, mount } from "@fimbul-works/seidr";
import { $button, $div, $input } from "@fimbul-works/seidr/html";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFocusScope } from "./use-focus-scope.js";

describe("useFocusScope", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("autofocuses the first tabbable element on mount", async () => {
    const scopeRef = createRef<HTMLDivElement>();

    const Comp = createComponent(() => {
      useFocusScope(scopeRef);
      return $div({ ref: scopeRef }, [
        $div({}, "Not focusable"),
        $button({ id: "first-btn" }, "First"),
        $button({ id: "second-btn" }, "Second"),
      ]);
    });

    const unmount = mount(Comp, container);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const firstBtn = container.querySelector("#first-btn") as HTMLElement;
    expect(document.activeElement).toBe(firstBtn);

    unmount();
  });

  it("can prevent mount autofocus via onMountAutoFocus", async () => {
    const scopeRef = createRef<HTMLDivElement>();
    const onMountAutoFocus = vi.fn((e: Event) => e.preventDefault());

    const Comp = createComponent(() => {
      useFocusScope(scopeRef, { onMountAutoFocus });
      return $div({ ref: scopeRef }, [$button({ id: "btn" }, "Button")]);
    });

    const unmount = mount(Comp, container);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onMountAutoFocus).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(container.querySelector("#btn"));

    unmount();
  });

  it("injects focus sentinels when trapFocus is true", () => {
    const scopeRef = createRef<HTMLDivElement>();

    const Comp = createComponent(() => {
      useFocusScope(scopeRef, { trapFocus: true });
      return $div({ ref: scopeRef }, [$button({ id: "btn" }, "Button")]);
    });

    const unmount = mount(Comp, container);

    const sentinels = container.querySelectorAll("[data-focus-trap]");
    expect(sentinels.length).toBe(2);

    unmount();

    // Sentinels removed on unmount
    expect(container.querySelectorAll("[data-focus-trap]").length).toBe(0);
  });

  it("restores focus to previously focused element on unmount", async () => {
    const outsideBtn = document.createElement("button");
    outsideBtn.id = "outside-btn";
    container.appendChild(outsideBtn);
    outsideBtn.focus();
    expect(document.activeElement).toBe(outsideBtn);

    const scopeRef = createRef<HTMLDivElement>();

    const Comp = createComponent(() => {
      useFocusScope(scopeRef);
      return $div({ ref: scopeRef }, [$input({ id: "inner-input" })]);
    });

    const unmount = mount(Comp, container);

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(document.activeElement).toBe(container.querySelector("#inner-input"));

    unmount();

    expect(document.activeElement).toBe(outsideBtn);
  });
});
