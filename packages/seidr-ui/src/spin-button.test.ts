import { $, createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { SpinButton } from "./spin-button.js";

describeDualMode("SpinButton", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => HTMLElement) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  it("should have role='spinbutton', tabIndex=0, and correct ARIA attributes", () => {
    const root = setup(() => {
      return SpinButton({
        value: 2,
        valueText: "2 items",
        minValue: 1,
        maxValue: 3,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.getAttribute("data-component")).toBe("spin-button");
    expect(el.getAttribute("data-part")).toBeNull();
    expect(el.tabIndex).toBe(0);
    expect(String(el.getAttribute("aria-valuenow"))).toBe("2");
    expect(String(el.getAttribute("aria-valuemin"))).toBe("1");
    expect(String(el.getAttribute("aria-valuemax"))).toBe("3");
    expect(el.getAttribute("aria-valuetext")).toBe("2 items");
    expect(el.getAttribute("aria-disabled")).toBeNull();
    expect(el.getAttribute("aria-readonly")).toBeNull();
  });

  it("should display the value as text content by default when no children are provided", () => {
    const root = setup(() => {
      return SpinButton({
        defaultValue: 42,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;
    expect(el.textContent).toBe("42");
  });

  it("should render custom children when provided", () => {
    const root = setup(() => {
      return SpinButton({ value: 10 }, [$("span", {}, "Custom Content")]);
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;
    expect(el.textContent).toBe("Custom Content");
  });

  it("should have aria-disabled and tabIndex=-1 if disabled", () => {
    const root = setup(() => {
      return SpinButton({
        defaultValue: 2,
        disabled: true,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.hasAttribute("data-disabled")).toBe(true);
    expect(el.tabIndex).toBe(-1);
  });

  it("should have aria-readonly if readOnly", () => {
    const root = setup(() => {
      return SpinButton({
        defaultValue: 2,
        readOnly: true,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;
    expect(el.getAttribute("aria-readonly")).toBe("true");
    expect(el.hasAttribute("data-readonly")).toBe(true);
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return;

    const root = setup(() => {
      return SpinButton({
        defaultValue: 5,
        minValue: 0,
        maxValue: 10,
        "aria-label": "Quantity",
      });
    });

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });

  it("should handle uncontrolled keyboard navigation (ArrowUp, ArrowDown, PageUp, PageDown, Home, End)", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      return SpinButton({
        defaultValue: 5,
        minValue: 0,
        maxValue: 10,
        step: 1,
        largeStep: 5,
        onChange,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;

    if (!isSSR) {
      // ArrowUp: 5 -> 6
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(6, 5);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("6");
      expect(el.textContent).toBe("6");

      // ArrowDown: 6 -> 5
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(5, 6);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("5");

      // PageUp: 5 + 5 -> 10
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(10, 5);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("10");

      // PageDown: 10 - 5 -> 5
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(5, 10);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("5");

      // Home: -> 0 (minValue)
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(0, 5);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("0");

      // End: -> 10 (maxValue)
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(10, 0);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("10");
    }
  });

  it("should clamp at boundaries when loop is false", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      return SpinButton({
        defaultValue: 10,
        minValue: 0,
        maxValue: 10,
        loop: false,
        onChange,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;

    if (!isSSR) {
      // ArrowUp at maxValue should not exceed 10
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(String(el.getAttribute("aria-valuenow"))).toBe("10");

      // Jump to min
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(String(el.getAttribute("aria-valuenow"))).toBe("0");

      // ArrowDown at minValue should not go below 0
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(String(el.getAttribute("aria-valuenow"))).toBe("0");
    }
  });

  it("should roll around between min and max when loop is true", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      return SpinButton({
        defaultValue: 10,
        minValue: 0,
        maxValue: 10,
        loop: true,
        onChange,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;

    if (!isSSR) {
      // ArrowUp at maxValue wraps around to minValue (0)
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(0, 10);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("0");

      // ArrowDown at minValue wraps around to maxValue (10)
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(10, 0);
      expect(String(el.getAttribute("aria-valuenow"))).toBe("10");
    }
  });

  it("should support controlled value via reactive Value", () => {
    const val = createValue(100);
    const onChange = vi.fn((next: number) => val(next));

    const root = setup(() => {
      return SpinButton({
        value: val,
        valueText: val.as((v) => `${v}%`),
        step: 10,
        onChange,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;
    expect(el.textContent).toBe("100%");

    if (!isSSR) {
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith(110, 100);
      expect(val()).toBe(110);
      expect(el.textContent).toBe("110%");
    }
  });

  it("should trigger custom onIncrement and onDecrement callbacks if provided", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const onIncrementPage = vi.fn();
    const onDecrementPage = vi.fn();
    const onDecrementToMin = vi.fn();
    const onIncrementToMax = vi.fn();

    const root = setup(() => {
      return SpinButton({
        value: 5,
        onIncrement,
        onDecrement,
        onIncrementPage,
        onDecrementPage,
        onDecrementToMin,
        onIncrementToMax,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;

    if (!isSSR) {
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(onIncrement).toHaveBeenCalledTimes(1);

      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(onDecrement).toHaveBeenCalledTimes(1);

      el.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
      expect(onIncrementPage).toHaveBeenCalledTimes(1);

      el.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
      expect(onDecrementPage).toHaveBeenCalledTimes(1);

      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(onDecrementToMin).toHaveBeenCalledTimes(1);

      el.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(onIncrementToMax).toHaveBeenCalledTimes(1);
    }
  });

  it("should not mutate value when disabled or readOnly", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      return SpinButton({
        defaultValue: 5,
        disabled: true,
        onChange,
      });
    });

    const el = root.querySelector("[role='spinbutton']") as HTMLElement;

    if (!isSSR) {
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(onChange).not.toHaveBeenCalled();
      expect(String(el.getAttribute("aria-valuenow"))).toBe("5");
    }
  });
});

