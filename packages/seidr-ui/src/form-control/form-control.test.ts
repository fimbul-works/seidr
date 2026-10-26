import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { $input } from "@fimbul-works/seidr/html";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { FormControl, type ValidationState } from "./index.js";

const LABEL_TEXT = "Email Address";
const DESC_TEXT = "We will never share your email address.";
const ERROR_TEXT = "Please enter a valid email address.";

describeDualMode("FormControl", ({ getDocument, isSSR }) => {
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

  it("should render a basic form control with proper ARIA wiring", () => {
    const root = setup(() =>
      FormControl({
        id: "test-email",
        name: "email",
        label: LABEL_TEXT,
        field: $input({ type: "email", id: "test-email-field" }),
        description: DESC_TEXT,
        errorMessage: ERROR_TEXT,
      }),
    );

    const label = root.querySelector("label")!;
    const input = root.querySelector("input")!;
    const desc = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === DESC_TEXT);

    expect(label).not.toBeNull();
    expect(input).not.toBeNull();
    expect(desc).toBeDefined();

    expect(label.getAttribute("for")).toBe(input.id);
    expect(label.id).toBe("test-email-label");
    expect(desc?.id).toBe("test-email-description");

    // By default, not invalid, so error message is not rendered
    const errorEl = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === ERROR_TEXT);
    expect(errorEl).toBeUndefined();
  });

  it("should support pre-bound compound instance pattern FormControl.create", () => {
    const root = setup(() => {
      const form = FormControl.create({
        id: "prebound-form",
        name: "prebound-name",
        required: true,
      });

      return form.Root([
        form.Label(LABEL_TEXT),
        $input({ type: "text", ...form.fieldProps }),
        form.Description(DESC_TEXT),
      ]);
    });

    const label = root.querySelector("label")!;
    const input = root.querySelector("input")!;
    const desc = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === DESC_TEXT);

    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("name")).toBe("prebound-name");
    expect(input.hasAttribute("required")).toBe(true);
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(input.hasAttribute("data-required")).toBe(true);

    expect(input.getAttribute("aria-labelledby")).toBe(label.id);
    expect(input.getAttribute("aria-describedby")).toBe(desc?.id);
  });

  it("should wire error message and aria-describedby when invalid", () => {
    const root = setup(() =>
      FormControl({
        id: "invalid-field",
        name: "test",
        validationState: "invalid",
        label: LABEL_TEXT,
        field: $input({ type: "text", id: "invalid-field-input" }),
        description: DESC_TEXT,
        errorMessage: ERROR_TEXT,
      }),
    );

    const rootEl = root.querySelector("#invalid-field")!;
    const label = root.querySelector("label")!;
    const errorEl = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === ERROR_TEXT);

    expect(rootEl.hasAttribute("data-invalid")).toBe(true);
    expect(label.hasAttribute("data-invalid")).toBe(true);
    expect(errorEl).toBeDefined();
    expect(errorEl?.hasAttribute("data-invalid")).toBe(true);
    expect(errorEl?.id).toBe("invalid-field-error-message");
  });

  it("should support forceMount keeping error message in DOM with hidden attribute when valid", () => {
    const root = setup(() => {
      const form = FormControl.create({
        id: "force-mount-form",
        validationState: "valid",
      });

      return form.Root([
        form.Label(LABEL_TEXT),
        $input({ ...form.fieldProps }),
        form.ErrorMessage({ forceMount: true }, ERROR_TEXT),
      ]);
    });

    const errorEl = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === ERROR_TEXT);
    expect(errorEl).toBeDefined();
    expect(errorEl?.hasAttribute("hidden")).toBe(true);
    expect(errorEl?.hasAttribute("data-valid")).toBe(true);
  });

  it("should not set htmlFor on Label when as is not label", () => {
    const root = setup(() => {
      const form = FormControl.create({ id: "custom-label-form" });
      return form.Root([
        form.Label({ as: "span" }, LABEL_TEXT),
        $input(form.fieldProps),
      ]);
    });

    const spanLabel = root.querySelector("span")!;
    expect(spanLabel).not.toBeNull();
    expect(spanLabel.textContent).toBe(LABEL_TEXT);
    expect(spanLabel.hasAttribute("for")).toBe(false);
  });

  if (!isSSR) {
    it("should reactively update ARIA attributes and error visibility on validationState change", () => {
      const validationState = createValue<ValidationState | undefined>(undefined);
      const root = setup(() => {
        const form = FormControl.create({
          id: "reactive-form",
          validationState,
        });

        return form.Root([
          form.Label(LABEL_TEXT),
          $input(form.fieldProps),
          form.Description(DESC_TEXT),
          form.ErrorMessage(ERROR_TEXT),
        ]);
      });

      const input = root.querySelector("input")!;
      const desc = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === DESC_TEXT)!;

      // Initially valid/undefined: only description in aria-describedby
      expect(input.getAttribute("aria-describedby")).toBe(desc.id);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
      expect(root.textContent).not.toContain(ERROR_TEXT);

      // Mutate to invalid
      validationState("invalid");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(root.textContent).toContain(ERROR_TEXT);

      const errorEl = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === ERROR_TEXT)!;
      expect(input.getAttribute("aria-describedby")).toBe(`${desc.id} ${errorEl.id}`);

      // Mutate back to valid
      validationState("valid");
      expect(input.hasAttribute("aria-invalid")).toBe(false);
      expect(input.getAttribute("aria-describedby")).toBe(desc.id);
      expect(root.textContent).not.toContain(ERROR_TEXT);
      expect(input.hasAttribute("data-valid")).toBe(true);
    });

    it("should pass axe accessibility checks", async () => {
      const root = setup(() => {
        const form = FormControl.create({
          id: "accessible-email-field",
          required: true,
        });

        return form.Root([
          form.Label(LABEL_TEXT),
          $input({ type: "email", ...form.fieldProps }),
          form.Description(DESC_TEXT),
          form.ErrorMessage(ERROR_TEXT),
        ]);
      });

      // @ts-expect-error vitest-axe types
      expect(await axe(root)).toHaveNoViolations();
    });
  }
});
