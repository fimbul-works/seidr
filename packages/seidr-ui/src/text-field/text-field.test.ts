import { $, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createTextField, TextField } from "./index.js";

describeDualMode("TextField", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => SeidrChild) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    unmount = mount(factory, target);
    return target;
  };

  it("can have a default value and updates on input (uncontrolled)", () => {
    const onChangeSpy = vi.fn();

    const root = setup(() => {
      const field = createTextField({ defaultValue: "cat", onChange: onChangeSpy });
      return field.Root({}, [field.Label({}, "Favorite Pet"), field.Input()]);
    });

    const input = root.querySelector("input") as HTMLInputElement;
    const label = root.querySelector("label") as HTMLLabelElement;

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input.value).toBe("cat");
    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("aria-labelledby")).toBe(label.id);

    if (isSSR) return;

    input.value = "cats";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChangeSpy).toHaveBeenCalledWith("cats");
    expect(input.value).toBe("cats");
  });

  it("value can be controlled with static value", () => {
    const onChangeSpy = vi.fn();

    const root = setup(() =>
      TextField({
        value: "cat",
        onChange: onChangeSpy,
        label: "Favorite Pet",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("cat");

    if (isSSR) return;

    input.value = "cats";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChangeSpy).toHaveBeenCalledWith("cats");
    // "cat" because value prop is static controlled
    expect(input.value).toBe("cat");
  });

  it("value can be controlled with reactive Value", () => {
    const reactiveVal = createValue("dog");
    const onChangeSpy = vi.fn();

    const root = setup(() =>
      TextField({
        value: reactiveVal,
        onChange: onChangeSpy,
        label: "Pet",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("dog");

    if (isSSR) return;

    input.value = "dogs";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChangeSpy).toHaveBeenCalledWith("dogs");
    expect(reactiveVal()).toBe("dogs");
    expect(input.value).toBe("dogs");
  });

  it("supports controlled name attribute", () => {
    const root = setup(() =>
      TextField({
        name: "favorite-pet",
        label: "Favorite Pet",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("name")).toBe("favorite-pet");
  });

  it("supports visible label and auto-associates for and aria-labelledby", () => {
    const root = setup(() =>
      TextField({
        label: "Username",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    const label = root.querySelector("label") as HTMLLabelElement;

    expect(input.getAttribute("aria-labelledby")).toBe(label.id);
    expect(label.getAttribute("for")).toBe(input.id);
  });

  it("supports explicit aria-labelledby and combines with visible label", () => {
    const root = setup(() => {
      const field = createTextField();
      return field.Root({}, [field.Label({}, "Visible Label"), field.Input({ ariaLabelledBy: "custom-id" })]);
    });

    const input = root.querySelector("input") as HTMLInputElement;
    const label = root.querySelector("label") as HTMLLabelElement;

    expect(input.getAttribute("aria-labelledby")).toBe(`custom-id ${label.id}`);
  });

  it("combines aria-labelledby if visible label and aria-label are both provided", () => {
    const root = setup(() => {
      const field = createTextField();
      return field.Root({}, [
        field.Label({}, "Visible Label"),
        field.Input({ ariaLabel: "Explicit Label", ariaLabelledBy: "custom-id" }),
      ]);
    });

    const input = root.querySelector("input") as HTMLInputElement;
    const label = root.querySelector("label") as HTMLLabelElement;

    expect(input.getAttribute("aria-labelledby")).toBe(`custom-id ${label.id} ${input.id}`);
  });

  it("supports visible description and links via aria-describedby", () => {
    const root = setup(() =>
      TextField({
        label: "Password",
        description: "Must be at least 8 characters",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    const description = root.querySelector("[data-part='description']") as HTMLElement;

    expect(description).not.toBeNull();
    expect(input.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("combines explicit aria-describedby with visible description", () => {
    const root = setup(() => {
      const field = createTextField();
      return field.Root({}, [field.Input({ "aria-describedby": "extra-help" }), field.Description({}, "Help text")]);
    });

    const input = root.querySelector("input") as HTMLInputElement;
    const description = root.querySelector("[data-part='description']") as HTMLElement;

    expect(input.getAttribute("aria-describedby")).toBe(`${description.id} extra-help`);
  });

  it("supports visible error message when invalid and includes in aria-describedby", () => {
    const root = setup(() =>
      TextField({
        validationState: "invalid",
        label: "Email",
        errorMessage: "Please enter a valid email",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    const errorMessage = root.querySelector("[data-part='error-message']") as HTMLElement;

    expect(errorMessage).not.toBeNull();
    expect(input.getAttribute("aria-describedby")).toBe(errorMessage.id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("does not describe by error message when valid", () => {
    const root = setup(() =>
      TextField({
        validationState: "valid",
        label: "Email",
        errorMessage: "Error",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("combines description and error message in aria-describedby when invalid", () => {
    const root = setup(() =>
      TextField({
        validationState: "invalid",
        label: "Username",
        description: "Your handle",
        errorMessage: "Username already taken",
      }),
    );

    const input = root.querySelector("input") as HTMLInputElement;
    const description = root.querySelector("[data-part='description']") as HTMLElement;
    const errorMessage = root.querySelector("[data-part='error-message']") as HTMLElement;

    expect(input.getAttribute("aria-describedby")).toBe(`${description.id} ${errorMessage.id}`);
  });

  it("sets data-* attributes for form-control validation states", () => {
    const root = setup(() =>
      TextField({
        validationState: "invalid",
        required: true,
        disabled: true,
        readOnly: true,
        label: "Test",
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const input = root.querySelector("input") as HTMLInputElement;

    for (const el of [rootEl, input]) {
      expect(el.hasAttribute("data-invalid")).toBe(true);
      expect(el.hasAttribute("data-required")).toBe(true);
      expect(el.hasAttribute("data-disabled")).toBe(true);
      expect(el.hasAttribute("data-readonly")).toBe(true);
    }

    expect(input.getAttribute("required")).toBe("");
    expect(input.getAttribute("disabled")).toBe("");
    expect(input.getAttribute("readonly")).toBe("");
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(input.getAttribute("aria-disabled")).toBe("true");
    expect(input.getAttribute("aria-readonly")).toBe("true");
  });

  it("supports multi-line textarea with submitOnEnter", () => {
    const root = setup(() =>
      TextField({
        multiline: true,
        submitOnEnter: true,
        label: "Comments",
      }),
    );

    const textarea = root.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.getAttribute("data-part")).toBe("text-area");
    expect(textarea.getAttribute("aria-multiline")).toBe("false");
  });

  it("supports multi-line textarea without submitOnEnter (normal multiline)", () => {
    const root = setup(() =>
      TextField({
        multiline: true,
        label: "Bio",
      }),
    );

    const textarea = root.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.hasAttribute("aria-multiline")).toBe(false);
  });

  it("supports form reset restoring defaultValue", () => {
    if (isSSR) return;

    let formEl!: HTMLFormElement;
    const root = setup(() => {
      const form = $("form", {}, [
        TextField({
          defaultValue: "initial-text",
          label: "Feedback",
        }),
      ]);
      formEl = form;
      return form;
    });

    const input = root.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("initial-text");

    input.value = "edited-text";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("edited-text");

    formEl.reset();
    expect(input.value).toBe("initial-text");
  });

  it("passes axe accessibility checks in client mode", async () => {
    if (isSSR) return;

    const root = setup(() =>
      TextField({
        label: "First Name",
        description: "Please enter your legal first name.",
        placeholder: "e.g. Jane",
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });
});
