import { $, createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import type { ValidationState } from "../form-control/types.js";
import { createSegmentedControl, SegmentedControl } from "./index.js";
import { SegmentedControlIndicator } from "./segmented-control-indicator.js";
import { SegmentedControlItem } from "./segmented-control-item.js";
import { SegmentedControlItemInput } from "./segmented-control-item-input.js";
import { SegmentedControlRoot } from "./segmented-control-root.js";
import type { SegmentedControlItemDescriptor } from "./types.js";

describeDualMode("SegmentedControl", ({ getDocument, isSSR }) => {
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

  it("should generate default ids and WAI-ARIA attributes", () => {
    const root = setup(() => {
      const sc = createSegmentedControl();
      return sc.Root({}, [
        sc.Label({}, "View Mode"),
        sc.Indicator({}),
        sc.Item({ value: "day", label: "Day" }),
        sc.Item({ value: "week", label: "Week" }),
      ]);
    });

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    const items = root.querySelectorAll("[role='group']");
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const indicator = root.querySelector("[role='presentation']") as HTMLElement;
    const label = root.querySelector(`#${radiogroup.id}-label`) as HTMLElement;

    expect(radiogroup).not.toBeNull();
    expect(items.length).toBe(2);
    expect(inputs.length).toBe(2);
    expect(indicator).not.toBeNull();
    expect(label).not.toBeNull();

    // Semantic data-component and data-part annotations
    expect(radiogroup.getAttribute("data-component")).toBe("segmented-control");
    expect(radiogroup.getAttribute("data-part")).toBe("root");
    expect(indicator.getAttribute("data-component")).toBe("segmented-control");
    expect(indicator.getAttribute("data-part")).toBe("indicator");
    expect(items[0]?.getAttribute("data-component")).toBe("segmented-control");
    expect(items[0]?.getAttribute("data-part")).toBe("item");
    expect(inputs[0]?.getAttribute("data-component")).toBe("segmented-control");
    expect(inputs[0]?.getAttribute("data-part")).toBe("item-input");
    expect(label.getAttribute("data-component")).toBe("segmented-control");
    expect(label.getAttribute("data-part")).toBe("label");

    // Default orientation is horizontal
    expect(radiogroup.getAttribute("aria-orientation")).toBe("horizontal");
    expect(indicator.getAttribute("data-orientation")).toBe("horizontal");
    expect(radiogroup.getAttribute("aria-labelledby")).toBe(label.id);

    expect(inputs[0]?.value).toBe("day");
    expect(inputs[1]?.value).toBe("week");
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return; // Axe requires full browser DOM

    const root = setup(() => {
      const sc = createSegmentedControl({ defaultValue: "day" });
      return sc.Root({}, [
        sc.Label({}, "View Mode"),
        sc.Indicator({}),
        sc.Item({ value: "day", label: "Day" }),
        sc.Item({ value: "week", label: "Week" }),
      ]);
    });

    // @ts-expect-error vitest-axe types
    expect(await axe(root)).toHaveNoViolations();
  });

  it("should handle uncontrolled state with defaultValue and clicks", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const sc = createSegmentedControl({
        defaultValue: "month",
        onChange,
      });
      return sc.Root({}, [
        sc.Label({}, "Calendar View"),
        sc.Indicator({}),
        sc.Item({ value: "day", label: "Day" }),
        sc.Item({ value: "week", label: "Week" }),
        sc.Item({ value: "month", label: "Month" }),
      ]);
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const items = root.querySelectorAll("[role='group']");
    const labels = root.querySelectorAll("label");

    const checked2 = isSSR ? inputs[2]?.hasAttribute("checked") : inputs[2]?.checked;
    expect(checked2).toBe(true);
    expect(items[2]?.getAttribute("data-checked")).toBe("");
    expect(items[0]?.hasAttribute("data-checked")).toBe(false);

    if (!isSSR) {
      labels[0]?.click();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("day", "month");
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[2]?.checked).toBe(false);
      expect(items[0]?.getAttribute("data-checked")).toBe("");
      expect(items[2]?.hasAttribute("data-checked")).toBe(false);
    }
  });

  it("should handle controlled state updates", () => {
    let setValue!: (v: string) => void;
    const onChange = vi.fn();

    const root = setup(() => {
      const value = createValue("day");
      setValue = (v: string) => value(v);

      const sc = createSegmentedControl({
        value,
        onChange,
      });
      return sc.Root({}, [
        sc.Indicator({}),
        sc.Item({ value: "day", label: "Day" }),
        sc.Item({ value: "week", label: "Week" }),
      ]);
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const items = root.querySelectorAll("[role='group']");

    expect(items[0]?.hasAttribute("data-checked")).toBe(true);
    expect(items[1]?.hasAttribute("data-checked")).toBe(false);

    if (!isSSR) {
      const labels = root.querySelectorAll("label");
      labels[1]?.click();
      expect(onChange).toHaveBeenCalledWith("week", "day");

      setValue("week");
      expect(items[1]?.hasAttribute("data-checked")).toBe(true);
      expect(items[0]?.hasAttribute("data-checked")).toBe(false);

      setValue("day");
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[1]?.checked).toBe(false);
      expect(items[0]?.hasAttribute("data-checked")).toBe(true);
      expect(items[1]?.hasAttribute("data-checked")).toBe(false);
    }
  });

  it("should support vertical orientation", () => {
    const root = setup(() => {
      const sc = createSegmentedControl({ orientation: "vertical" });
      return sc.Root({}, [
        sc.Indicator({}),
        sc.Item({ value: "v1", label: "Vertical 1" }),
        sc.Item({ value: "v2", label: "Vertical 2" }),
      ]);
    });

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    const indicator = root.querySelector("[role='presentation']") as HTMLElement;

    expect(radiogroup.getAttribute("aria-orientation")).toBe("vertical");
    expect(indicator.getAttribute("data-orientation")).toBe("vertical");
  });

  it("should prevent selection when disabled or readOnly", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const sc = createSegmentedControl({
        readOnly: true,
        defaultValue: "day",
        onChange,
      });
      return sc.Root({}, [
        sc.Indicator({}),
        sc.Item({ value: "day", label: "Day" }),
        sc.Item({ value: "week", label: "Week" }),
      ]);
    });

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    expect(radiogroup.hasAttribute("data-readonly")).toBe(true);
    expect(radiogroup.getAttribute("aria-readonly")).toBe("true");

    if (!isSSR) {
      const labels = root.querySelectorAll("label");
      labels[1]?.click();
      expect(onChange).not.toHaveBeenCalled();
      const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[1]?.checked).toBe(false);
    }
  });

  it("should disable individual item when disabled prop is set", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const sc = createSegmentedControl({
        defaultValue: "day",
        onChange,
      });
      return sc.Root({}, [
        sc.Indicator({}),
        sc.Item({ value: "day", label: "Day" }),
        sc.Item({ value: "week", label: "Week", disabled: true }),
      ]);
    });

    const items = root.querySelectorAll("[role='group']");
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;

    expect(items[1]?.hasAttribute("data-disabled")).toBe(true);
    expect(inputs[1]?.disabled).toBe(true);

    if (!isSSR) {
      const labels = root.querySelectorAll("label");
      labels[1]?.click();
      expect(onChange).not.toHaveBeenCalled();
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[1]?.checked).toBe(false);
    }
  });

  it("should support validationState and error message linkage", () => {
    let setValidation!: (v: ValidationState) => void;

    const root = setup(() => {
      const valState = createValue<ValidationState | undefined>("valid");
      setValidation = (v: ValidationState) => valState(v);

      const sc = createSegmentedControl({ validationState: valState });
      return sc.Root({}, [
        sc.Label({}, "View Mode"),
        sc.Item({ value: "day", label: "Day" }),
        sc.ErrorMessage({}, "Please select a view mode"),
      ]);
    });

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    expect(radiogroup.hasAttribute("data-valid")).toBe(true);
    expect(radiogroup.hasAttribute("data-invalid")).toBe(false);
    expect(radiogroup.getAttribute("aria-invalid")).toBeNull();

    if (!isSSR) {
      setValidation("invalid");
      expect(radiogroup.hasAttribute("data-invalid")).toBe(true);
      expect(radiogroup.getAttribute("aria-invalid")).toBe("true");

      const error = root.querySelector(`#${radiogroup.id}-error-message`);
      expect(error).not.toBeNull();
      expect(radiogroup.getAttribute("aria-describedby")).toContain(error?.id);
    }
  });

  it("should restore defaultValue on parent form reset", () => {
    const root = setup(() => {
      const sc = createSegmentedControl({ defaultValue: "day" });
      return $("form", [
        sc.Root({}, [
          sc.Label({}, "View"),
          sc.Item({ value: "day", label: "Day" }),
          sc.Item({ value: "week", label: "Week" }),
        ]),
      ]);
    });

    const form = root.querySelector("form") as HTMLFormElement;
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const labels = root.querySelectorAll("label");

    if (!isSSR) {
      labels[1]?.click();
      expect(inputs[1]?.checked).toBe(true);
      expect(inputs[0]?.checked).toBe(false);

      form.reset();
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[1]?.checked).toBe(false);
    }
  });

  it("should support all-in-one declarative SegmentedControl component", () => {
    const onChange = vi.fn();
    const root = setup(() =>
      SegmentedControl({
        className: "my-segmented-control",
        label: "Layout",
        defaultValue: "grid",
        onChange,
        items: [
          { value: "list", label: "List" },
          { value: "grid", label: "Grid" },
          { value: "table", label: "Table" },
        ],
      }),
    );

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    const indicator = root.querySelector("[role='presentation']") as HTMLElement;
    const items = root.querySelectorAll("[role='group']");
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;

    expect(radiogroup).not.toBeNull();
    expect(radiogroup.classList.contains("my-segmented-control")).toBe(true);
    expect(indicator).not.toBeNull();
    expect(items.length).toBe(3);
    expect(inputs.length).toBe(3);

    const checked1 = isSSR ? inputs[1]?.hasAttribute("checked") : inputs[1]?.checked;
    expect(checked1).toBe(true);

    if (!isSSR) {
      const labels = root.querySelectorAll("label");
      labels[0]?.click();
      expect(onChange).toHaveBeenCalledWith("list", "grid");
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[1]?.checked).toBe(false);
    }
  });

  it("should support dynamic reactive item lists with List()", () => {
    let setItems!: (items: SegmentedControlItemDescriptor[]) => void;

    const root = setup(() => {
      const itemsValue = createValue<SegmentedControlItemDescriptor[]>([
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
      ]);
      setItems = (v) => itemsValue(v);

      return SegmentedControl({
        defaultValue: "opt1",
        items: itemsValue,
      });
    });

    let items = root.querySelectorAll("[role='group']");
    expect(items.length).toBe(2);

    if (!isSSR) {
      setItems([
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
        { value: "opt3", label: "Option 3" },
      ]);

      items = root.querySelectorAll("[role='group']");
      expect(items.length).toBe(3);
    }
  });

  it("supports sc.List helper in Tier 2 coordinator with custom renderItem", () => {
    const root = setup(() => {
      const sc = createSegmentedControl({ defaultValue: "tab-1" });
      const dynamicItems = createValue<SegmentedControlItemDescriptor[]>([
        { value: "tab-1", label: "Tab 1" },
        { value: "tab-2", label: "Tab 2" },
      ]);

      return sc.Root({}, [
        sc.List(dynamicItems, {
          renderItem: (itemVal, key, inst) =>
            inst.Root({}, [
              inst.Input(),
              inst.Label({}, itemVal.as((i) => `Custom: ${i.label}`)),
            ]),
        }),
      ]);
    });

    const items = root.querySelectorAll("[role='group']");
    expect(items.length).toBe(2);
    expect(items[0]?.textContent).toContain("Custom: Tab 1");
    expect(items[1]?.textContent).toContain("Custom: Tab 2");
  });

  it("should support keyboard navigation across items with arrow keys, Home, and End", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      return SegmentedControl({
        defaultValue: "week",
        onChange,
        items: [
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
          { value: "year", label: "Year" },
        ],
      });
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBe(4);

    // Initial state: "week" (index 1) is selected
    expect(inputs[1]?.checked).toBe(true);

    if (!isSSR) {
      // ArrowRight from "week" (1) -> "month" (2)
      inputs[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("month", "week");
      expect(inputs[2]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[2]);

      // ArrowDown from "month" (2) -> "year" (3)
      inputs[2]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("year", "month");
      expect(inputs[3]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[3]);

      // ArrowRight from "year" (3) wraps -> "day" (0)
      inputs[3]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("day", "year");
      expect(inputs[0]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[0]);

      // ArrowLeft from "day" (0) wraps -> "year" (3)
      inputs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("year", "day");
      expect(inputs[3]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[3]);

      // ArrowUp from "year" (3) -> "month" (2)
      inputs[3]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("month", "year");
      expect(inputs[2]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[2]);

      // Home moves to first item: "day" (0)
      inputs[2]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("day", "month");
      expect(inputs[0]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[0]);

      // End moves to last item: "year" (3)
      inputs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("year", "day");
      expect(inputs[3]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[3]);
    }
  });

  it("should focus input and select when clicking the item container", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      return SegmentedControl({
        defaultValue: "day",
        onChange,
        items: [
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
        ],
      });
    });

    const items = root.querySelectorAll("[role='group']");
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;

    if (!isSSR) {
      // Click container of item 1 (week)
      (items[1] as HTMLElement)?.click();
      expect(onChange).toHaveBeenCalledWith("week", "day");
      expect(inputs[1]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[1]);
    }
  });

  it("should include input and support keyboard when custom children are passed to sc.Item", () => {
    const root = setup(() => {
      const sc = createSegmentedControl({ defaultValue: "light" });
      return sc.Root({}, [
        sc.Indicator({}),
        sc.Item({ value: "light" }, [$("span", {}, "Light")]),
        sc.Item({ value: "dark" }, [$("span", {}, "Dark")]),
      ]);
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBe(2);
    expect(inputs[0]?.value).toBe("light");
    expect(inputs[1]?.value).toBe("dark");
    expect(inputs[0]?.checked).toBe(true);

    if (!isSSR) {
      inputs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(inputs[1]?.checked).toBe(true);
      expect(document.activeElement).toBe(inputs[1]);
    }
  });

  it("should throw SeidrError when subcomponents are instantiated without an instance", () => {
    expect(() => SegmentedControlRoot({})).toThrow("SegmentedControlRoot requires an instance coordinator");
    expect(() => SegmentedControlItem({})).toThrow("SegmentedControlItem requires an instance coordinator");
    expect(() => SegmentedControlItemInput({})).toThrow("SegmentedControlItemInput requires an instance coordinator");
    expect(() => SegmentedControlIndicator({})).toThrow("SegmentedControlIndicator requires an instance coordinator");
  });
});
