import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createNumberField, NumberField } from "./index.js";

describeDualMode("NumberField", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => SeidrChild) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  const getInputValue = (el: HTMLInputElement | null) => {
    if (!el) return "";
    return isSSR ? (el.getAttribute("value") ?? "") : el.value;
  };

  const isButtonDisabled = (el: HTMLButtonElement | null) => {
    if (!el) return false;
    return isSSR ? el.hasAttribute("disabled") : el.disabled;
  };

  const isInputDisabled = (el: HTMLInputElement | null) => {
    if (!el) return false;
    return isSSR ? el.hasAttribute("disabled") : el.disabled;
  };

  const isInputReadOnly = (el: HTMLInputElement | null) => {
    if (!el) return false;
    return isSSR ? el.hasAttribute("readonly") : el.readOnly;
  };

  it("renders with default props and proper semantic and ARIA attributes", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 10,
        minValue: 0,
        maxValue: 100,
        label: "Quantity",
        description: "Choose an amount between 0 and 100",
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    const label = root.querySelector("[data-part='label']") as HTMLLabelElement;
    const desc = root.querySelector("[data-part='description']") as HTMLElement;
    const hidden = root.querySelector("[data-part='hidden-input']") as HTMLInputElement;
    const incBtn = root.querySelector("[data-part='increment-trigger']") as HTMLButtonElement;
    const decBtn = root.querySelector("[data-part='decrement-trigger']") as HTMLButtonElement;

    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("number-field");
    expect(rootEl.getAttribute("data-part")).toBe("root");
    expect(rootEl.getAttribute("role")).toBe("group");

    expect(input).not.toBeNull();
    expect(input.getAttribute("data-component")).toBe("number-field");
    expect(input.getAttribute("data-part")).toBe("input");
    expect(getInputValue(input)).toBe("10");
    expect(input.getAttribute("aria-valuenow")).toBe("10");
    expect(input.getAttribute("aria-valuemin")).toBe("0");
    expect(input.getAttribute("aria-valuemax")).toBe("100");
    expect(input.getAttribute("inputmode")).toBe("decimal");

    expect(label).not.toBeNull();
    expect(label.getAttribute("data-component")).toBe("number-field");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("aria-labelledby")).toBe(label.id);

    expect(desc).not.toBeNull();
    expect(desc.getAttribute("data-component")).toBe("number-field");
    expect(desc.getAttribute("data-part")).toBe("description");
    expect(input.getAttribute("aria-describedby")).toBe(desc.id);

    expect(hidden).not.toBeNull();
    expect(hidden.getAttribute("data-component")).toBe("number-field");
    expect(hidden.getAttribute("data-part")).toBe("hidden-input");
    expect(getInputValue(hidden)).toBe("10");
    expect(hidden.getAttribute("aria-hidden")).toBe("true");

    expect(incBtn).not.toBeNull();
    expect(incBtn.getAttribute("data-component")).toBe("number-field");
    expect(incBtn.getAttribute("data-part")).toBe("increment-trigger");
    expect(incBtn.getAttribute("aria-controls")).toBe(input.id);

    expect(decBtn).not.toBeNull();
    expect(decBtn.getAttribute("data-component")).toBe("number-field");
    expect(decBtn.getAttribute("data-part")).toBe("decrement-trigger");
    expect(decBtn.getAttribute("aria-controls")).toBe(input.id);
  });

  it("passes axe accessibility checks", async () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 5,
        minValue: 0,
        maxValue: 10,
        label: "Score",
      }),
    );

    if (isSSR) return;

    // @ts-expect-error vitest-axe types
    expect(await axe(root)).toHaveNoViolations();
  });

  it("supports fine-grained composition via createNumberField (Tier 2)", () => {
    const root = setup(() => {
      const nf = createNumberField({ defaultValue: 42 });
      return nf.Root({}, [
        nf.Label({}, "Custom Label"),
        nf.DecrementTrigger({}, "Minus"),
        nf.Input(),
        nf.IncrementTrigger({}, "Plus"),
        nf.HiddenInput(),
      ]);
    });

    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(getInputValue(input)).toBe("42");
    expect(root.querySelector("[data-part='decrement-trigger']")?.textContent).toBe("Minus");
    expect(root.querySelector("[data-part='increment-trigger']")?.textContent).toBe("Plus");
  });

  it("formats value using Intl.NumberFormat options", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 1234.5,
        locale: "en-US",
        formatOptions: {
          style: "currency",
          currency: "USD",
        },
      }),
    );

    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    const hidden = root.querySelector("[data-part='hidden-input']") as HTMLInputElement;

    expect(getInputValue(input)).toBe("$1,234.50");
    expect(getInputValue(hidden)).toBe("1234.5");
  });

  it("increments and decrements value on trigger click", () => {
    const onRawChange = vi.fn();
    const root = setup(() =>
      NumberField({
        defaultValue: 10,
        step: 2,
        minValue: 0,
        maxValue: 20,
        onRawValueChange: onRawChange,
      }),
    );

    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    const hidden = root.querySelector("[data-part='hidden-input']") as HTMLInputElement;
    const incBtn = root.querySelector("[data-part='increment-trigger']") as HTMLButtonElement;
    const decBtn = root.querySelector("[data-part='decrement-trigger']") as HTMLButtonElement;

    if (isSSR) return;

    incBtn.click();
    expect(getInputValue(input)).toBe("12");
    expect(getInputValue(hidden)).toBe("12");
    expect(onRawChange).toHaveBeenCalledWith(12);

    decBtn.click();
    expect(getInputValue(input)).toBe("10");
    expect(getInputValue(hidden)).toBe("10");
    expect(onRawChange).toHaveBeenCalledWith(10);
  });

  it("disables decrement button at minValue and increment button at maxValue", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        step: 1,
      }),
    );

    const incBtn = root.querySelector("[data-part='increment-trigger']") as HTMLButtonElement;
    const decBtn = root.querySelector("[data-part='decrement-trigger']") as HTMLButtonElement;

    expect(isButtonDisabled(decBtn)).toBe(true);
    expect(isButtonDisabled(incBtn)).toBe(false);

    if (isSSR) return;

    incBtn.click();
    expect(isButtonDisabled(decBtn)).toBe(false);
    expect(isButtonDisabled(incBtn)).toBe(true);
  });

  it("handles keyboard navigation: ArrowUp, ArrowDown, PageUp, PageDown, Home, End", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 5,
        step: 1,
        largeStep: 5,
        minValue: 0,
        maxValue: 20,
      }),
    );

    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;

    if (isSSR) return;

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(getInputValue(input)).toBe("6");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(getInputValue(input)).toBe("5");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
    expect(getInputValue(input)).toBe("10");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
    expect(getInputValue(input)).toBe("5");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(getInputValue(input)).toBe("20");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(getInputValue(input)).toBe("0");
  });

  it("handles mouse wheel when input is focused", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 10,
        step: 1,
        changeOnWheel: true,
      }),
    );

    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;

    if (isSSR) return;

    input.focus();

    input.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true }));
    expect(getInputValue(input)).toBe("11");

    input.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, bubbles: true }));
    expect(getInputValue(input)).toBe("10");
  });

  it("supports controlled rawValue with reactive Value", () => {
    const rawVal = createValue(25, { id: "test-controlled-raw-value" });
    const onRawChange = vi.fn();

    const root = setup(() =>
      NumberField({
        rawValue: rawVal,
        onRawValueChange: onRawChange,
      }),
    );

    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    expect(getInputValue(input)).toBe("25");

    if (isSSR) return;

    rawVal(50);
    expect(getInputValue(input)).toBe("50");

    const incBtn = root.querySelector("[data-part='increment-trigger']") as HTMLButtonElement;
    incBtn.click();
    expect(onRawChange).toHaveBeenCalledWith(51);
  });

  it("supports disabled state", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 10,
        disabled: true,
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    const incBtn = root.querySelector("[data-part='increment-trigger']") as HTMLButtonElement;
    const decBtn = root.querySelector("[data-part='decrement-trigger']") as HTMLButtonElement;

    expect(rootEl.hasAttribute("data-disabled")).toBe(true);
    expect(isInputDisabled(input)).toBe(true);
    expect(input.getAttribute("aria-disabled")).toBe("true");
    expect(isButtonDisabled(incBtn)).toBe(true);
    expect(isButtonDisabled(decBtn)).toBe(true);

    if (isSSR) return;

    incBtn.click();
    expect(getInputValue(input)).toBe("10");
  });

  it("supports readOnly state", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 10,
        readOnly: true,
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    const incBtn = root.querySelector("[data-part='increment-trigger']") as HTMLButtonElement;

    expect(rootEl.hasAttribute("data-readonly")).toBe(true);
    expect(isInputReadOnly(input)).toBe(true);
    expect(input.getAttribute("aria-readonly")).toBe("true");

    if (isSSR) return;

    incBtn.click();
    expect(getInputValue(input)).toBe("10");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(getInputValue(input)).toBe("10");
  });

  it("renders error message and sets aria-invalid when invalid", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 5,
        validationState: "invalid",
        errorMessage: "Value is out of range",
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    const errorMsg = root.querySelector("[data-part='error-message']") as HTMLElement;

    expect(rootEl.hasAttribute("data-invalid")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(errorMsg).not.toBeNull();
    expect(errorMsg.textContent).toBe("Value is out of range");
    expect(input.getAttribute("aria-describedby")).toBe(errorMsg.id);
  });

  it("formats value on blur after user typing", () => {
    const root = setup(() =>
      NumberField({
        defaultValue: 100,
        locale: "en-US",
        formatOptions: {
          style: "currency",
          currency: "EUR",
        },
      }),
    );

    const input = root.querySelector("[role='spinbutton']") as HTMLInputElement;
    expect(getInputValue(input)).toBe("€100.00");

    if (isSSR) return;

    input.value = "250";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(getInputValue(input)).toBe("250");

    input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    expect(getInputValue(input)).toBe("€250.00");
  });
});
