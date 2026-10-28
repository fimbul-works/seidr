import { $, createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import type { ValidationState } from "../form-control/types.js";
import { createRadioGroup, RadioGroup } from "./index.js";
import type { RadioGroupItemDescriptor } from "./types.js";

describeDualMode("RadioGroup", ({ getDocument, isSSR }) => {
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

  it("should generate default ids and WAI-ARIA attributes", () => {
    const root = setup(() => {
      const rg = createRadioGroup();
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats" }),
      ]);
    });

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    const items = root.querySelectorAll("[role='group']");
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const label = root.querySelector(`#${radiogroup.id}-label`) as HTMLElement;

    expect(radiogroup).not.toBeNull();
    expect(items.length).toBe(2);
    expect(inputs.length).toBe(2);
    expect(label).not.toBeNull();

    expect(radiogroup.getAttribute("aria-orientation")).toBe("vertical");
    expect(radiogroup.getAttribute("aria-labelledby")).toBe(label.id);

    const name0 = inputs[0].getAttribute("name");
    const name1 = inputs[1].getAttribute("name");
    expect(name0).toBeNull();
    expect(name1).toBeNull();

    expect(inputs[0].value).toBe("dogs");
    expect(inputs[1].value).toBe("cats");

    const checked0 = isSSR ? inputs[0].hasAttribute("checked") : inputs[0].checked;
    const checked1 = isSSR ? inputs[1].hasAttribute("checked") : inputs[1].checked;
    expect(checked0).toBe(false);
    expect(checked1).toBe(false);
  });

  it("should support custom ids, orientation, and names", () => {
    const root = setup(() => {
      const rg = createRadioGroup({
        id: "pet-selector",
        name: "pets",
        orientation: "horizontal",
      });
      return rg.Root([
        rg.Label("Select a Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats" }),
      ]);
    });

    const radiogroup = root.querySelector("#pet-selector") as HTMLElement;
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;

    expect(radiogroup).not.toBeNull();
    expect(radiogroup.getAttribute("aria-orientation")).toBe("horizontal");

    const name0 = isSSR ? inputs[0].getAttribute("name") : inputs[0].name;
    const name1 = isSSR ? inputs[1].getAttribute("name") : inputs[1].name;
    expect(name0).toBe("pets");
    expect(name1).toBe("pets");
  });

  it("should support defaultValue (uncontrolled selection)", () => {
    const root = setup(() => {
      const rg = createRadioGroup({ defaultValue: "cats" });
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats" }),
      ]);
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const items = root.querySelectorAll("[role='group']");

    const checked0 = isSSR ? inputs[0].hasAttribute("checked") : inputs[0].checked;
    const checked1 = isSSR ? inputs[1].hasAttribute("checked") : inputs[1].checked;

    expect(checked0).toBe(false);
    expect(checked1).toBe(true);

    expect(items[0].hasAttribute("data-checked")).toBe(false);
    expect(items[1].hasAttribute("data-checked")).toBe(true);
  });

  it("should update selection when clicking item label or control", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const rg = createRadioGroup({ onChange });
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats" }),
      ]);
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const items = root.querySelectorAll("[role='group']");
    const labels = root.querySelectorAll("label");

    if (!isSSR) {
      // Click 'Cats' label
      labels[1].click();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("cats", "");

      expect(inputs[0].checked).toBe(false);
      expect(inputs[1].checked).toBe(true);
      expect(items[0].hasAttribute("data-checked")).toBe(false);
      expect(items[1].hasAttribute("data-checked")).toBe(true);

      // Click 'Dogs' label
      labels[0].click();
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith("dogs", "cats");

      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);
      expect(items[0].hasAttribute("data-checked")).toBe(true);
      expect(items[1].hasAttribute("data-checked")).toBe(false);
    }
  });

  it("should select value when pressing Space key on item control", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const rg = createRadioGroup({ defaultValue: "dogs", onChange });
      const catItem = rg.createItem({ value: "cats" });

      return rg.Root([
        rg.Label("Pets"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        catItem.Root([catItem.Input(), catItem.Control([catItem.Indicator()]), catItem.Label("Cats")]),
      ]);
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const catControl = root.querySelector(`#${inputs[1].id.replace("-input", "")}-control`) as HTMLElement;

    if (!isSSR) {
      const event = new KeyboardEvent("keydown", { key: " ", bubbles: true });
      catControl.dispatchEvent(event);

      expect(onChange).toHaveBeenCalledWith("cats", "dogs");
      expect(inputs[1].checked).toBe(true);
      expect(inputs[0].checked).toBe(false);
    }
  });

  it("should support controlled selection via reactive Value", () => {
    let updateVal!: (v: string) => void;

    const root = setup(() => {
      const selected = createValue("dogs");
      updateVal = (v: string) => selected(v);

      const rg = createRadioGroup({ value: selected });
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats" }),
      ]);
    });

    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const items = root.querySelectorAll("[role='group']");

    const checked0 = isSSR ? inputs[0].hasAttribute("checked") : inputs[0].checked;
    const checked1 = isSSR ? inputs[1].hasAttribute("checked") : inputs[1].checked;
    expect(checked0).toBe(true);
    expect(checked1).toBe(false);

    if (!isSSR) {
      updateVal("cats");
      expect(inputs[0].checked).toBe(false);
      expect(inputs[1].checked).toBe(true);
      expect(items[0].hasAttribute("data-checked")).toBe(false);
      expect(items[1].hasAttribute("data-checked")).toBe(true);
    }
  });

  it("should prevent selection when group is disabled", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const rg = createRadioGroup({ disabled: true, defaultValue: "dogs", onChange });
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats" }),
      ]);
    });

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const labels = root.querySelectorAll("label");

    expect(radiogroup.hasAttribute("data-disabled")).toBe(true);
    expect(radiogroup.getAttribute("aria-disabled")).toBe("true");

    const input0Disabled = isSSR ? inputs[0].hasAttribute("disabled") : inputs[0].disabled;
    const input1Disabled = isSSR ? inputs[1].hasAttribute("disabled") : inputs[1].disabled;
    expect(input0Disabled).toBe(true);
    expect(input1Disabled).toBe(true);

    if (!isSSR) {
      labels[1].click();
      expect(onChange).not.toHaveBeenCalled();
      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);
    }
  });

  it("should prevent selection when an individual item is disabled", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const rg = createRadioGroup({ defaultValue: "dogs", onChange });
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats", disabled: true }),
        rg.Item({ value: "dragons", label: "Dragons" }),
      ]);
    });

    const items = root.querySelectorAll("[role='group']");
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const labels = root.querySelectorAll("label");

    expect(items[0].hasAttribute("data-disabled")).toBe(false);
    expect(items[1].hasAttribute("data-disabled")).toBe(true);
    expect(items[2].hasAttribute("data-disabled")).toBe(false);

    if (!isSSR) {
      // Clicking disabled item (cats) does nothing
      labels[1].click();
      expect(onChange).not.toHaveBeenCalled();
      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);

      // Clicking enabled item (dragons) works
      labels[2].click();
      expect(onChange).toHaveBeenCalledWith("dragons", "dogs");
      expect(inputs[2].checked).toBe(true);
      expect(inputs[0].checked).toBe(false);
    }
  });

  it("should prevent selection when group is readOnly", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const rg = createRadioGroup({ readOnly: true, defaultValue: "dogs", onChange });
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.Item({ value: "cats", label: "Cats" }),
      ]);
    });

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const labels = root.querySelectorAll("label");

    expect(radiogroup.hasAttribute("data-readonly")).toBe(true);
    expect(radiogroup.getAttribute("aria-readonly")).toBe("true");

    if (!isSSR) {
      labels[1].click();
      expect(onChange).not.toHaveBeenCalled();
      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);
    }
  });

  it("should support validationState and error message linkage", () => {
    let setValidation!: (v: ValidationState) => void;

    const root = setup(() => {
      const valState = createValue<ValidationState | undefined>("valid");
      setValidation = (v: ValidationState) => valState(v);

      const rg = createRadioGroup({ validationState: valState });
      return rg.Root([
        rg.Label("Favorite Pet"),
        rg.Item({ value: "dogs", label: "Dogs" }),
        rg.ErrorMessage("A pet selection is required"),
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
      const rg = createRadioGroup({ defaultValue: "dogs" });
      return $("form", [
        rg.Root([
          rg.Label("Favorite Pet"),
          rg.Item({ value: "dogs", label: "Dogs" }),
          rg.Item({ value: "cats", label: "Cats" }),
        ]),
      ]);
    });

    const form = root.querySelector("form") as HTMLFormElement;
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const labels = root.querySelectorAll("label");

    if (!isSSR) {
      labels[1].click();
      expect(inputs[1].checked).toBe(true);
      expect(inputs[0].checked).toBe(false);

      form.reset();
      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);
    }
  });

  it("should support all-in-one declarative RadioGroup component", () => {
    const onChange = vi.fn();
    const root = setup(() =>
      RadioGroup({
        className: "my-radiogroup",
        label: "Choose a Framework",
        defaultValue: "seidr",
        onChange,
        items: [
          { value: "react", label: "React" },
          { value: "solid", label: "Solid" },
          { value: "seidr", label: "Seidr" },
        ],
      }),
    );

    const radiogroup = root.querySelector("[role='radiogroup']") as HTMLElement;
    const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const labels = root.querySelectorAll("label");

    expect(radiogroup.classList.contains("my-radiogroup")).toBe(true);
    expect(inputs.length).toBe(3);

    const checked2 = isSSR ? inputs[2].hasAttribute("checked") : inputs[2].checked;
    expect(checked2).toBe(true);

    if (!isSSR) {
      labels[1].click();
      expect(onChange).toHaveBeenCalledWith("solid", "seidr");
      expect(inputs[1].checked).toBe(true);
      expect(inputs[2].checked).toBe(false);
    }
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return; // Axe requires full browser DOM

    const root = setup(() =>
      RadioGroup({
        label: "Accessible Choice",
        defaultValue: "one",
        items: [
          { value: "one", label: "Option One" },
          { value: "two", label: "Option Two" },
        ],
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });

  it("should support dynamic radio group items via reactive array Value", () => {
    let setItems!: (items: RadioGroupItemDescriptor[]) => void;

    const root = setup(() => {
      const dynamicItems = createValue<RadioGroupItemDescriptor[]>([
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
      ]);
      setItems = (items) => dynamicItems(items);

      return RadioGroup({
        label: "Dynamic Group",
        defaultValue: "opt1",
        items: dynamicItems,
      });
    });

    let inputs = root.querySelectorAll("input");
    expect(inputs.length).toBe(2);

    if (!isSSR) {
      // Add a third option dynamically
      setItems([
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
        { value: "opt3", label: "Option 3" },
      ]);

      inputs = root.querySelectorAll("input");
      expect(inputs.length).toBe(3);
      expect(inputs[2].value).toBe("opt3");

      // Remove the second option dynamically
      setItems([
        { value: "opt1", label: "Option 1" },
        { value: "opt3", label: "Option 3" },
      ]);

      inputs = root.querySelectorAll("input");
      expect(inputs.length).toBe(2);
      expect(inputs[0].value).toBe("opt1");
      expect(inputs[1].value).toBe("opt3");
    }
  });

  it("should support reactive forceMount on ItemIndicator", () => {
    let setForceMount!: (val: boolean) => void;

    const root = setup(() => {
      const forceMount = createValue(false);
      setForceMount = (val) => forceMount(val);

      const rg = createRadioGroup({ defaultValue: "dogs" });
      const catsItem = rg.createItem({ value: "cats" });

      return rg.Root([
        rg.Item({ value: "dogs", label: "Dogs" }),
        catsItem.Root([
          catsItem.Input(),
          catsItem.Control([catsItem.Indicator({ forceMount, id: "cats-indicator" })]),
          catsItem.Label("Cats"),
        ]),
      ]);
    });

    // Dogs is selected, Cats is not selected
    // Initially forceMount is false, so cats-indicator is NOT in DOM
    expect(root.querySelector("#cats-indicator")).toBeNull();

    if (!isSSR) {
      // Toggle forceMount to true reactively
      setForceMount(true);
      expect(root.querySelector("#cats-indicator")).not.toBeNull();

      // Toggle forceMount back to false
      setForceMount(false);
      expect(root.querySelector("#cats-indicator")).toBeNull();
    }
  });

  it("should support reactive styles and style overrides on ItemInput", () => {
    let setOpacity: (val: number | string | undefined) => void;

    const root = setup(() => {
      const opacity = createValue<number | string | undefined>(0);
      setOpacity = (val) => opacity(val);

      const rg = createRadioGroup();
      const item = rg.createItem({ value: "test" });

      return rg.Root([
        item.Root([
          item.Input({
            id: "styled-input",
            style: {
              opacity,
              clip: "",
            },
          }),
        ]),
      ]);
    });

    const input = root.querySelector("#styled-input") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.style.opacity).toBe("0");
    expect(input.style.position).toBe("absolute");
    expect(input.style.clip).toBe("");

    if (!isSSR) {
      setOpacity!(0.5);
      expect(input.style.opacity).toBe("0.5");
    }
  });
});
