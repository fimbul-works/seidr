import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createTextField, TextField } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./text-field.css";

export const TextFieldShowcase = createComponent(() => {
  const emailInput = createValue("alice@example.com");
  const isFieldDisabled = createValue(false);
  const isFieldReadOnly = createValue(false);

  // Derived reactive validation state
  const emailValidationState = emailInput.as((val) => {
    if (!val || val.length === 0) return undefined;
    const isValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
    return isValid ? "valid" : "invalid";
  });

  // Example 3: Tier 2 Fine-Grained Coordinator Pattern
  const customField = createTextField({
    id: "showcase-custom-sculpted",
    required: true,
    disabled: isFieldDisabled,
    readOnly: isFieldReadOnly,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "TextField"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible text field component supporting single-line inputs and auto-resizing multi-line textareas, with automatic ARIA wiring, reactive validation states, and fine-grained state management.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isFieldDisabled.as((d) => `control-btn ${d ? "active" : ""}`),
            onclick: () => isFieldDisabled(!isFieldDisabled()),
          },
          isFieldDisabled.as((d) => (d ? "Enable Fields" : "Disable Fields")),
        ),
        $button(
          {
            className: isFieldReadOnly.as((ro) => `control-btn ${ro ? "active" : ""}`),
            onclick: () => isFieldReadOnly(!isFieldReadOnly()),
          },
          isFieldReadOnly.as((ro) => (ro ? "Set Editable" : "Set Read-Only")),
        ),
      ]),

      $div({ className: "text-field-showcase" }, [
        // 1. Interactive Single-Line TextField with Reactive Validation
        $div({ className: "text-field-box" }, [
          $span({ className: "text-field-box-title" }, "1. Single-Line with Reactive Validation"),
          TextField({
            id: "showcase-email-field",
            name: "email",
            label: "Email Address",
            placeholder: "name@example.com",
            value: emailInput,
            onChange: (v) => emailInput(v),
            validationState: emailValidationState,
            required: true,
            disabled: isFieldDisabled,
            readOnly: isFieldReadOnly,
            description: "Type an invalid email to see reactive validation states update.",
            errorMessage: "Please enter a valid email address with an '@' and domain.",
          }),
          $div(
            { className: "text-field-value-display" },
            emailInput.as((val) => `Live Value: "${val}"`),
          ),
        ]),

        // 2. Auto-Resizing Multi-Line TextArea
        $div({ className: "text-field-box" }, [
          $span({ className: "text-field-box-title" }, "2. Multi-Line TextArea with Auto-Resize"),
          TextField({
            id: "showcase-notes-field",
            name: "notes",
            label: "Notes & Comments",
            placeholder: "Type multiple lines to test auto-resize...",
            multiline: true,
            autoResize: true,
            defaultValue:
              "Seidr UI provides fine-grained reactive components with zero virtual DOM overhead.\nTry adding more lines here to watch the textarea expand smoothly!",
            disabled: isFieldDisabled,
            readOnly: isFieldReadOnly,
            description: "Auto-resize dynamically adjusts the height as content expands.",
          }),
        ]),

        // 3. Fine-Grained Coordinator (createTextField)
        $div({ className: "text-field-box" }, [
          $span({ className: "text-field-box-title" }, "3. Fine-Grained Coordinator (createTextField)"),
          customField.Root({}, [
            customField.Label({}, "Custom Sculpted Input"),
            customField.Input({
              placeholder: "Fine-grained subcomponent placement...",
            }),
            customField.Description({}, "Built using Tier 2 createTextField for fine-grained DOM layout sculpting."),
          ]),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { TextField, createTextField } from "@fimbul-works/seidr-ui";

// 1. Tier 1: Unified All-in-One Component
TextField({
  label: "Email Address",
  placeholder: "you@example.com",
  value: email,
  onChange: setEmail,
  validationState: isValid.as(v => v ? "valid" : "invalid"),
  required: true,
  description: "We will never share your email.",
  errorMessage: "Please enter a valid email.",
});

// 2. Multi-line TextArea with Auto-Resize
TextField({
  label: "Bio",
  multiline: true,
  autoResize: true,
  submitOnEnter: false,
  defaultValue: "Initial content...",
});

// 3. Tier 2: Fine-Grained Coordinator Pattern
const field = createTextField({ required: true });

field.Root([
  field.Label("Custom Label"),
  field.Input({ placeholder: "Fine-grained control" }),
  field.Description("Explicit layout coordination"),
]);`,
    ),
  ]);
}, "TextFieldShowcase");
