import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Checkbox } from "./index.js";

describeDualMode("Checkbox", ({ getDocument, isSSR }) => {
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

  it("should generate default ids and aria attributes", () => {
    const root = setup(() => {
      const cb = Checkbox.create();
      return cb.Root([
        cb.Input(),
        cb.Control([cb.Indicator({ forceMount: true }, "✓")]),
        cb.Label("Subscribe to newsletter"),
      ]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;
    const indicator = root.querySelector(`#${group.id}-indicator`) as HTMLElement;
    const label = root.querySelector("label") as HTMLLabelElement;

    expect(group).not.toBeNull();
    expect(input).not.toBeNull();
    expect(control).not.toBeNull();
    expect(indicator).not.toBeNull();
    expect(label).not.toBeNull();

    expect(input.id).toBe(`${group.id}-input`);
    const val = isSSR ? input.getAttribute("value") : input.value;
    expect(val).toBe("on");
    expect(label.getAttribute("for")).toBe(input.id);

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(false);
  });

  it("should support custom ids", () => {
    const root = setup(() => {
      const cb = Checkbox.create({ id: "my-custom-cb" });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator({ forceMount: true }, "✓")]), cb.Label("Custom Checkbox")]);
    });

    const group = root.querySelector("#my-custom-cb");
    const input = root.querySelector("#my-custom-cb-input");
    const control = root.querySelector("#my-custom-cb-control");
    const indicator = root.querySelector("#my-custom-cb-indicator");
    const label = root.querySelector("#my-custom-cb-label");

    expect(group).not.toBeNull();
    expect(input).not.toBeNull();
    expect(control).not.toBeNull();
    expect(indicator).not.toBeNull();
    expect(label).not.toBeNull();
  });

  it("should support custom name and value", () => {
    const root = setup(() => {
      const cb = Checkbox.create({
        name: "terms",
        value: "accepted",
      });
      return cb.Root([cb.Input(), cb.Control(), cb.Label("Terms")]);
    });

    const input = root.querySelector("input") as HTMLInputElement;
    const name = isSSR ? input.getAttribute("name") : input.name;
    const value = isSSR ? input.getAttribute("value") : input.value;
    expect(name).toBe("terms");
    expect(value).toBe("accepted");
  });

  it("should support defaultChecked: true", () => {
    const root = setup(() => {
      const cb = Checkbox.create({ defaultChecked: true });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator("✓")]), cb.Label("Remember me")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const indicator = root.querySelector(`#${group.id}-indicator`);

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(true);
    expect(group.hasAttribute("data-checked")).toBe(true);
    expect(indicator).not.toBeNull();
  });

  it("should toggle checked state when clicking the control or input", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const cb = Checkbox.create({ onChange });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator("✓")]), cb.Label("Toggle me")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(false);
    expect(group.hasAttribute("data-checked")).toBe(false);

    if (!isSSR) {
      control.click();
      expect(input.checked).toBe(true);
      expect(group.hasAttribute("data-checked")).toBe(true);
      expect(onChange).toHaveBeenCalledWith(true);

      control.click();
      expect(input.checked).toBe(false);
      expect(group.hasAttribute("data-checked")).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    }
  });

  it("should toggle when pressing Space on the control", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const cb = Checkbox.create({ onChange });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator("✓")]), cb.Label("Space key toggle")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;

    if (!isSSR) {
      control.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      expect(input.checked).toBe(true);
      expect(group.hasAttribute("data-checked")).toBe(true);
      expect(onChange).toHaveBeenCalledWith(true);
    }
  });

  it("should support controlled checked state via reactive Value", () => {
    const checked = createValue(false);
    const onChange = vi.fn((val: boolean) => checked(val));

    const root = setup(() => {
      const cb = Checkbox.create({
        checked,
        onChange,
      });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator("✓")]), cb.Label("Controlled")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(false);

    if (!isSSR) {
      checked(true);
      expect(input.checked).toBe(true);
      expect(group.hasAttribute("data-checked")).toBe(true);

      checked(false);
      expect(input.checked).toBe(false);
      expect(group.hasAttribute("data-checked")).toBe(false);
    }
  });

  it("should support indeterminate state", () => {
    const root = setup(() => {
      const cb = Checkbox.create({ indeterminate: true });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator("-")]), cb.Label("Select all")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const indicator = root.querySelector(`#${group.id}-indicator`);

    expect(group.hasAttribute("data-indeterminate")).toBe(true);
    expect(indicator).not.toBeNull();

    if (!isSSR) {
      expect(input.indeterminate).toBe(true);
    }
  });

  it("should guard against changes when disabled", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const cb = Checkbox.create({ disabled: true, onChange });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator("✓")]), cb.Label("Disabled Option")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;

    const isDisabled = isSSR ? input.hasAttribute("disabled") : input.disabled;
    expect(isDisabled).toBe(true);
    expect(group.hasAttribute("data-disabled")).toBe(true);

    if (!isSSR) {
      control.click();
      expect(input.checked).toBe(false);
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it("should guard against changes when readOnly", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const cb = Checkbox.create({ readOnly: true, onChange });
      return cb.Root([cb.Input(), cb.Control([cb.Indicator("✓")]), cb.Label("Read Only Option")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;

    expect(group.hasAttribute("data-readonly")).toBe(true);
    expect(input.getAttribute("aria-readonly")).toBe("true");

    if (!isSSR) {
      control.click();
      expect(input.checked).toBe(false);
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it("should support validationState and error message linking", () => {
    const validationState = createValue<"valid" | "invalid" | undefined>("invalid");

    const root = setup(() => {
      const cb = Checkbox.create({
        id: "validated-cb",
        validationState,
      });
      return cb.Root([
        cb.Input(),
        cb.Control([cb.Indicator("✓")]),
        cb.Label("Must accept"),
        cb.ErrorMessage("You must accept this check to continue"),
      ]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const errorMsg = root.querySelector("#validated-cb-error-message") as HTMLElement;

    expect(group.hasAttribute("data-invalid")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(errorMsg).not.toBeNull();
    expect(input.getAttribute("aria-describedby")).toContain("validated-cb-error-message");
  });

  it("should support unified Checkbox helper", () => {
    const root = setup(() =>
      Checkbox({
        id: "unified-test",
        label: "I agree to the Terms of Service",
        description: "Review terms carefully before proceeding.",
        defaultChecked: true,
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    const label = root.querySelector("label") as HTMLLabelElement;
    const desc = root.querySelector("#unified-test-description") as HTMLElement;

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(desc).not.toBeNull();
    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(true);
    expect(label.textContent).toBe("I agree to the Terms of Service");
  });

  if (!isSSR) {
    it("should pass axe accessibility checks", async () => {
      const root = setup(() =>
        Checkbox({
          id: "axe-checkbox-test",
          label: "Acceptable terms and conditions",
          description: "Checking this box indicates agreement.",
        }),
      );

      // @ts-expect-error vitest-axe types
      expect(await axe(root)).toHaveNoViolations();
    });
  }
});
