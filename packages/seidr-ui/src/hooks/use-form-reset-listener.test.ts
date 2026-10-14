import { createComponent, createRef, mount } from "@fimbul-works/seidr";
import { $button, $form, $input } from "@fimbul-works/seidr/html";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFormResetListener } from "./use-form-reset-listener.js";

describe("useFormResetListener", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("invokes handler when parent form is reset", () => {
    const handleReset = vi.fn();
    const inputRef = createRef<HTMLInputElement>();

    const Comp = createComponent(() => {
      useFormResetListener(inputRef, handleReset);
      return $form({}, [$input({ ref: inputRef }), $button({ type: "reset" }, "Reset")]);
    });

    const unmount = mount(Comp, container);

    expect(handleReset).not.toHaveBeenCalled();

    const form = container.querySelector("form")!;
    form.reset();

    expect(handleReset).toHaveBeenCalledTimes(1);

    unmount();

    // After unmount, reset does not call handler
    form.reset();
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it("does not attach listener or throw if element is not in a form", () => {
    const handleReset = vi.fn();
    const inputRef = createRef<HTMLInputElement>();

    const Comp = createComponent(() => {
      useFormResetListener(inputRef, handleReset);
      return $input({ ref: inputRef });
    });

    const unmount = mount(Comp, container);
    expect(handleReset).not.toHaveBeenCalled();
    unmount();
  });
});
