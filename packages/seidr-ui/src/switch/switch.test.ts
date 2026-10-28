import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import type { ValidationState } from "../form-control/types.js";
import { createSwitch, Switch } from "./index.js";

describeDualMode("Switch", ({ getDocument, isSSR }) => {
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
      const sw = createSwitch();
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Airplane Mode")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;
    const thumb = root.querySelector(`#${group.id}-thumb`) as HTMLElement;
    const label = root.querySelector("label") as HTMLLabelElement;

    expect(group).not.toBeNull();
    expect(input).not.toBeNull();
    expect(control).not.toBeNull();
    expect(thumb).not.toBeNull();
    expect(label).not.toBeNull();

    expect(group.getAttribute("data-component")).toBe("switch");
    expect(group.getAttribute("data-part")).toBe("root");
    expect(control.getAttribute("data-component")).toBe("switch");
    expect(control.getAttribute("data-part")).toBe("control");
    expect(thumb.getAttribute("data-component")).toBe("switch");
    expect(thumb.getAttribute("data-part")).toBe("thumb");
    expect(input.getAttribute("data-component")).toBe("switch");
    expect(input.getAttribute("data-part")).toBe("input");
    expect(label.getAttribute("data-component")).toBe("switch");
    expect(label.getAttribute("data-part")).toBe("label");

    expect(input.id).toBe(`${group.id}-input`);
    expect(input.getAttribute("type")).toBe("checkbox");
    expect(input.getAttribute("role")).toBe("switch");

    const val = isSSR ? input.getAttribute("value") : input.value;
    expect(val).toBe("on");
    expect(label.getAttribute("for")).toBe(input.id);

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(false);
    expect(input.getAttribute("aria-checked")).toBe("false");
  });

  it("should support custom ids", () => {
    const root = setup(() => {
      const sw = createSwitch({ id: "my-custom-sw" });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Custom Switch")]);
    });

    const group = root.querySelector("#my-custom-sw");
    const input = root.querySelector("#my-custom-sw-input");
    const control = root.querySelector("#my-custom-sw-control");
    const thumb = root.querySelector("#my-custom-sw-thumb");
    const label = root.querySelector("#my-custom-sw-label");

    expect(group).not.toBeNull();
    expect(input).not.toBeNull();
    expect(control).not.toBeNull();
    expect(thumb).not.toBeNull();
    expect(label).not.toBeNull();
  });

  it("should support custom name and value", () => {
    const root = setup(() => {
      const sw = createSwitch({ name: "airplane-mode", value: "active" });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({}))]);
    });

    const input = root.querySelector("input") as HTMLInputElement;
    const name = isSSR ? input.getAttribute("name") : input.name;
    const value = isSSR ? input.getAttribute("value") : input.value;
    expect(name).toBe("airplane-mode");
    expect(value).toBe("active");
  });

  it("should support defaultChecked: true", () => {
    const root = setup(() => {
      const sw = createSwitch({ defaultChecked: true });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Airplane Mode")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;
    const thumb = root.querySelector(`#${group.id}-thumb`) as HTMLElement;

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(true);
    expect(input.getAttribute("aria-checked")).toBe("true");

    expect(group.hasAttribute("data-checked")).toBe(true);
    expect(control.hasAttribute("data-checked")).toBe(true);
    expect(thumb.hasAttribute("data-checked")).toBe(true);
  });

  it("should toggle checked state when clicking the control or input", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const sw = createSwitch({ onChange });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Airplane Mode")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;
    const thumb = root.querySelector(`#${group.id}-thumb`) as HTMLElement;

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(false);
    expect(input.getAttribute("aria-checked")).toBe("false");
    expect(control.hasAttribute("data-checked")).toBe(false);

    if (!isSSR) {
      // Click control to turn ON
      control.click();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);

      expect(input.checked).toBe(true);
      expect(input.getAttribute("aria-checked")).toBe("true");
      expect(control.hasAttribute("data-checked")).toBe(true);
      expect(thumb.hasAttribute("data-checked")).toBe(true);
      expect(getDocument().activeElement).toBe(input);

      // Click control again to turn OFF
      control.click();
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith(false);

      expect(input.checked).toBe(false);
      expect(input.getAttribute("aria-checked")).toBe("false");
      expect(control.hasAttribute("data-checked")).toBe(false);
      expect(thumb.hasAttribute("data-checked")).toBe(false);
    }
  });

  it("should toggle when pressing Space on the control", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const sw = createSwitch({ onChange });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Airplane Mode")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;

    if (!isSSR) {
      const event = new KeyboardEvent("keydown", { key: " ", bubbles: true });
      control.dispatchEvent(event);

      expect(onChange).toHaveBeenCalledWith(true);
      expect(input.checked).toBe(true);
      expect(input.getAttribute("aria-checked")).toBe("true");
    }
  });

  it("should support controlled checked state via reactive Value", () => {
    let toggleVal: (v: boolean) => void;

    const root = setup(() => {
      const checkedVal = createValue(false);
      toggleVal = (v: boolean) => checkedVal(v);

      const sw = createSwitch({ checked: checkedVal });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Controlled Switch")]);
    });

    const input = root.querySelector("input") as HTMLInputElement;
    const isCheckedInit = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isCheckedInit).toBe(false);
    expect(input.getAttribute("aria-checked")).toBe("false");

    if (!isSSR) {
      toggleVal!(true);
      expect(input.checked).toBe(true);
      expect(input.getAttribute("aria-checked")).toBe("true");
    }
  });

  it("should guard against changes when disabled", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const sw = createSwitch({ disabled: true, onChange });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Airplane Mode")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;

    const isDisabled = isSSR ? input.hasAttribute("disabled") : input.disabled;
    expect(isDisabled).toBe(true);
    expect(input.getAttribute("aria-disabled")).toBe("true");
    expect(group.hasAttribute("data-disabled")).toBe(true);
    expect(control.hasAttribute("data-disabled")).toBe(true);

    if (!isSSR) {
      control.click();
      expect(onChange).not.toHaveBeenCalled();
      expect(input.checked).toBe(false);
    }
  });

  it("should guard against changes when readOnly", () => {
    const onChange = vi.fn();
    const root = setup(() => {
      const sw = createSwitch({ readOnly: true, onChange });
      return sw.Root({}, [sw.Input({}), sw.Control({}, sw.Thumb({})), sw.Label({}, "Airplane Mode")]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const control = root.querySelector(`#${group.id}-control`) as HTMLElement;

    const isReadOnly = isSSR ? input.hasAttribute("readonly") : input.readOnly;
    expect(isReadOnly).toBe(true);
    expect(input.getAttribute("aria-readonly")).toBe("true");
    expect(group.hasAttribute("data-readonly")).toBe(true);
    expect(control.hasAttribute("data-readonly")).toBe(true);

    if (!isSSR) {
      control.click();
      expect(onChange).not.toHaveBeenCalled();
      expect(input.checked).toBe(false);
    }
  });

  it("should support validationState and error message linking", () => {
    let setValidation: (state: ValidationState | undefined) => void;

    const root = setup(() => {
      const valState = createValue<ValidationState | undefined>("invalid");
      setValidation = (state) => valState(state);

      const sw = createSwitch({ validationState: valState });
      return sw.Root({}, [
        sw.Input({}),
        sw.Control({}, sw.Thumb({})),
        sw.Label({}, "Activate Account"),
        sw.ErrorMessage({}, "Account activation must be enabled."),
      ]);
    });

    const group = root.querySelector("[role='group']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;
    const errorMsg = root.querySelector(`#${group.id}-error-message`) as HTMLElement;

    expect(group.hasAttribute("data-invalid")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(errorMsg.id);

    if (!isSSR) {
      setValidation!("valid");
      expect(group.hasAttribute("data-invalid")).toBe(false);
      expect(group.hasAttribute("data-valid")).toBe(true);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
      expect(input.getAttribute("aria-describedby")).toBeNull();
    }
  });

  it("should support unified Switch helper", () => {
    const root = setup(() =>
      Switch({
        id: "unified-sw",
        label: "Wi-Fi",
        description: "Connect to available wireless networks",
        defaultChecked: true,
      }),
    );

    const group = root.querySelector("#unified-sw") as HTMLElement;
    const input = root.querySelector("#unified-sw-input") as HTMLInputElement;
    const label = root.querySelector("#unified-sw-label") as HTMLLabelElement;
    const desc = root.querySelector("#unified-sw-description") as HTMLElement;
    const thumb = root.querySelector("#unified-sw-thumb") as HTMLElement;

    expect(group).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(desc).not.toBeNull();
    expect(thumb).not.toBeNull();

    expect(label.textContent).toBe("Wi-Fi");
    expect(desc.textContent).toBe("Connect to available wireless networks");
    expect(input.getAttribute("aria-describedby")).toBe(desc.id);

    const isChecked = isSSR ? input.hasAttribute("checked") : input.checked;
    expect(isChecked).toBe(true);
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return; // Axe requires full DOM

    const root = setup(() =>
      Switch({
        id: "accessible-sw",
        label: "Bluetooth",
        description: "Visible to nearby devices",
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });
});
