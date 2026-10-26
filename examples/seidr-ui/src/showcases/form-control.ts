import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $input, $p, $section, $span } from "@fimbul-works/seidr/html";
import { FormControl } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./form-control.css";

export const FormControlShowcase = createComponent(() => {
  const emailInput = createValue("");
  const isFormDisabled = createValue(false);

  // Derived validation state
  const validationState = emailInput.as((val) => {
    if (!val || val.length === 0) return undefined;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    return isValidEmail ? "valid" : "invalid";
  });

  // Example 1: Pre-bound Instance Pattern (FormControl.create)
  const emailForm = FormControl.create({
    id: "showcase-email-control",
    name: "email",
    required: true,
    validationState,
    disabled: isFormDisabled,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "FormControl"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "Provides accessible form field coordination, auto-wiring labels, descriptions, and error messages to inputs with full WAI-ARIA compliance and fine-grained reactivity.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isFormDisabled.as((d) => `control-btn ${d ? "active" : ""}`),
            onclick: () => isFormDisabled(!isFormDisabled()),
          },
          isFormDisabled.as((d) => (d ? "Enable Fields" : "Disable Fields")),
        ),
      ]),

      $div({ className: "form-control-showcase" }, [
        // 1. Interactive Form Control with Pre-bound Compound Factory
        $div({ className: "form-control-box" }, [
          emailForm.Root({ className: "form-control-group" }, [
            emailForm.Label({ className: "form-control-label" }, "Email Address"),
            $input({
              type: "email",
              placeholder: "alice@example.com",
              className: "form-control-input",
              value: emailInput,
              oninput: (e: Event) => emailInput((e.target as HTMLInputElement).value),
              ...emailForm.fieldProps,
            }),
            emailForm.Description(
              { className: "form-control-description" },
              "Type a valid email to see reactive validation states update.",
            ),
            emailForm.ErrorMessage(
              { className: "form-control-error" },
              "Please enter a valid email address with an '@' and domain.",
            ),
          ]),
        ]),

        // 2. Unified All-In-One Helper
        $div({ className: "form-control-box" }, [
          FormControl({
            id: "showcase-username-control",
            name: "username",
            label: "Username",
            labelProps: { className: "form-control-label" },
            field: $input({
              type: "text",
              placeholder: "Enter unique username...",
              className: "form-control-input",
              disabled: isFormDisabled,
            }),
            description: "Usernames must be between 3 and 20 alphanumeric characters.",
            descriptionProps: { className: "form-control-description" },
            rootProps: { className: "form-control-group" },
          }),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { FormControl } from "@fimbul-works/seidr-ui";
import { $input } from "@fimbul-works/seidr/html";

// 1. Pre-bound Compound Instance Pattern (FormControl.create)
const form = FormControl.create({
  name: "email",
  required: true,
  validationState: emailError.as(err => err ? "invalid" : "valid"),
});

form.Root([
  form.Label("Email Address"),
  $input({ type: "email", ...form.fieldProps }),
  form.Description("We never share your email."),
  form.ErrorMessage("Please enter a valid email address."),
]);

// 2. Unified All-in-One Component
FormControl({
  name: "username",
  label: "Username",
  field: $input({ type: "text" }),
  description: "Must be 3-20 alphanumeric characters.",
});`,
    ),
  ]);
}, "FormControlShowcase");
