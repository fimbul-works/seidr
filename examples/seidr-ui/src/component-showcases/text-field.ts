import { createComponent, createValue, mergeValues, Show } from "@fimbul-works/seidr";
import {
  $button,
  $code,
  $div,
  $form,
  $h2,
  $h3,
  $li,
  $p,
  $section,
  $span,
  $strong,
  $ul,
} from "@fimbul-works/seidr/html";
import { createTextField, TextField } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./text-field.css";

export const TextFieldShowcase = createComponent(() => {
  const emailInput = createValue("alice@example.com");
  const notesPreview = createValue(
    "Seidr UI provides fine-grained reactive components with zero virtual DOM overhead.\nTry adding more lines here to watch the textarea expand smoothly!",
  );
  const isFieldDisabled = createValue(false);
  const isFieldReadOnly = createValue(false);

  // Derived reactive validation state
  const emailValidationState = emailInput.as((val) => {
    if (!val || val.length === 0) return undefined;
    const isValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
    return isValid ? "valid" : "invalid";
  });

  // Example 3: Tier 2 Fine-Grained Coordinator Pattern (Uncontrolled)
  const customField = createTextField({
    id: "showcase-custom-sculpted",
    defaultValue: "Initial sculpted value",
    required: true,
    disabled: isFieldDisabled,
    readOnly: isFieldReadOnly,
  });

  // Example 4: Tier 2 Controlled Form Coordination (createTextField + mergeValues)
  const username = createValue("");
  const password = createValue("");
  const isSubmitting = createValue(false);
  const submittedPayload = createValue<string | null>(null);

  const usernameValidation = username.as((val) => {
    if (!val) return undefined;
    return val.trim().length >= 3 ? "valid" : "invalid";
  });

  const passwordValidation = password.as((val) => {
    if (!val) return undefined;
    return val.length >= 6 ? "valid" : "invalid";
  });

  const isSubmitDisabled = mergeValues(
    () => username().trim().length < 3 || password().length < 6 || isSubmitting() || isFieldDisabled(),
    { parents: [username, password, isSubmitting, isFieldDisabled] },
  );

  // Option A: Pass controlled Value at coordinator creation
  const usernameField = createTextField({
    id: "showcase-form-username",
    name: "username",
    value: username,
    defaultValue: "",
    required: true,
    disabled: isFieldDisabled,
    readOnly: isFieldReadOnly,
    validationState: usernameValidation,
  });

  // Coordinator-level controlled Value (integrates with onChange + native <form> reset)
  const passwordField = createTextField({
    id: "showcase-form-password",
    name: "password",
    value: password,
    defaultValue: "",
    required: true,
    disabled: isFieldDisabled,
    readOnly: isFieldReadOnly,
    validationState: passwordValidation,
  });

  const handleFormSubmit = (e: Event) => {
    e.preventDefault();
    if (isSubmitDisabled()) return;

    isSubmitting(true);
    submittedPayload(`Submitted { username: "${username()}", passwordLength: ${password().length} }`);
    isSubmitting(false);
  };

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "TextField"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible text field component supporting single-line inputs and auto-resizing multi-line textareas, with automatic ARIA wiring, reactive validation states, form reset integration, and three-tier state management.",
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
        // 1. Tier 1: Interactive Single-Line TextField with Reactive Validation
        $div({ className: "text-field-box" }, [
          $span({ className: "text-field-box-title" }, "1. Tier 1 Controlled Single-Line with Reactive Validation"),
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

        // 2. Tier 1: Auto-Resizing Multi-Line TextArea (Uncontrolled)
        $div({ className: "text-field-box" }, [
          $span({ className: "text-field-box-title" }, "2. Tier 1 Uncontrolled Multi-Line TextArea with Auto-Resize"),
          TextField({
            id: "showcase-notes-field",
            name: "notes",
            label: "Notes & Comments",
            placeholder: "Type multiple lines to test auto-resize...",
            multiline: true,
            autoResize: true,
            defaultValue: notesPreview(),
            onChange: (v) => notesPreview(v),
            disabled: isFieldDisabled,
            readOnly: isFieldReadOnly,
            description:
              "Auto-resize dynamically adjusts the height as content expands; onChange receives string values.",
          }),
          $div(
            { className: "text-field-value-display" },
            notesPreview.as((val) => `Length: ${val.length} chars | Lines: ${val.split("\n").length}`),
          ),
        ]),

        // 3. Tier 2: Uncontrolled Fine-Grained Coordinator (createTextField)
        $div({ className: "text-field-box" }, [
          $span({ className: "text-field-box-title" }, "3. Tier 2 Uncontrolled Coordinator (createTextField)"),
          customField.Root({}, [
            customField.Label({}, "Custom Sculpted Input"),
            $div({ className: "text-field-inline-row" }, [
              customField.Input({
                placeholder: "Fine-grained subcomponent placement...",
              }),
              $button(
                {
                  type: "button",
                  className: "control-btn",
                  disabled: isFieldDisabled,
                  onclick: () => customField.setValue("Reset programmatically!"),
                },
                "Set Value",
              ),
            ]),
            customField.Description(
              {},
              "Uncontrolled mode manages state internally; read customField.value reactively or call customField.setValue().",
            ),
          ]),
          $div(
            { className: "text-field-value-display" },
            customField.value.as((val) => `customField.value: "${val}"`),
          ),
        ]),

        // 4. Tier 2: Complete Controlled Form Coordination + mergeValues
        $div({ className: "text-field-box" }, [
          $span({ className: "text-field-box-title" }, "4. Tier 2 Form Coordination (createTextField + mergeValues)"),
          $form(
            {
              className: "text-field-demo-form",
              onsubmit: handleFormSubmit,
              onreset: () => submittedPayload(null),
            },
            [
              usernameField.Root({}, [
                usernameField.Label({}, "Username"),
                usernameField.Input({ placeholder: "At least 3 characters..." }),
                usernameField.Description({}, "Controlled at coordinator level: createTextField({ value: username })."),
                usernameField.ErrorMessage({}, "Username must be at least 3 characters."),
              ]),
              passwordField.Root({}, [
                passwordField.Label({}, "Password"),
                passwordField.Input({
                  type: "password",
                  placeholder: "At least 6 characters...",
                }),
                passwordField.Description(
                  {},
                  "Controlled at coordinator level so native form reset restores defaultValue.",
                ),
                passwordField.ErrorMessage({}, "Password must be at least 6 characters."),
              ]),
              $div({ className: "controls-row" }, [
                $button(
                  {
                    type: "submit",
                    className: "control-btn active",
                    disabled: isSubmitDisabled,
                  },
                  isSubmitting.as((s) => (s ? "Submitting..." : "Submit Form")),
                ),
                $button(
                  {
                    type: "reset",
                    className: "control-btn",
                    disabled: isFieldDisabled,
                  },
                  "Reset Form",
                ),
              ]),
            ],
          ),
          $div(
            { className: "text-field-value-display" },
            mergeValues(
              () =>
                `username: "${username()}" | password len: ${password().length} | submit disabled: ${isSubmitDisabled()}`,
              { parents: [username, password, isSubmitDisabled] },
            ),
          ),
          Show(
            submittedPayload.as((msg) => !!msg),
            () =>
              $div(
                { className: "text-field-submit-result" },
                submittedPayload.as((msg) => msg ?? ""),
              ),
          ),
        ]),
      ]),
    ]),

    // Documentation Notes & Guidelines
    $div({ className: "text-field-docs" }, [
      $h3({ className: "text-field-docs-title" }, "How TextField Works (Architecture & Patterns)"),
      $ul({ className: "text-field-docs-list" }, [
        $li({}, [
          $strong({}, "Three-Tier API: "),
          "Use ",
          $code({}, "TextField(props)"),
          " (Tier 1) for standard stacked fields; ",
          $code({}, "createTextField(options)"),
          " (Tier 2) when sculpting custom DOM layouts with pre-bound ",
          $code({}, "Root / Label / Input / TextArea / Description / ErrorMessage"),
          " factories; or ",
          $code({}, "useTextField(options)"),
          " (Tier 3) for fully headless markup using ",
          $code({}, "fieldProps"),
          ", ",
          $code({}, "dataset"),
          ", ",
          $code({}, "inputRef"),
          ", and ",
          $code({}, "onInput"),
          ".",
        ]),
        $li({}, [
          $strong({}, "Controlled vs. Uncontrolled State: "),
          "Pass ",
          $code({}, "defaultValue"),
          " for uncontrolled fields (state lives internally and resets automatically on native ",
          $code({}, "<form>"),
          " reset via ",
          $code({}, "useFormResetListener"),
          "). Pass a reactive ",
          $code({}, "Value<string>"),
          " via ",
          $code({}, "value"),
          " to ",
          $code({}, "createTextField({ value })"),
          " (recommended—also integrates with ",
          $code({}, "field.value"),
          ", ",
          $code({}, "onChange"),
          ", and native ",
          $code({}, "<form>"),
          " reset) or directly to ",
          $code({}, "field.Input({ value })"),
          " / ",
          $code({}, "field.TextArea({ value })"),
          " for direct two-way input binding. Notice ",
          $code({}, "field.value"),
          " is always a read-only ",
          $code({}, "DerivedValue<string>"),
          ".",
        ]),
        $li({}, [
          $strong({}, "onChange vs. native oninput: "),
          "The coordinator's ",
          $code({}, "onChange"),
          " callback receives the ",
          $strong({}, "string value"),
          " directly (",
          $code({}, "(value: string) => void"),
          "), not a DOM ",
          $code({}, "Event"),
          ". Native ",
          $code({}, "oninput"),
          " and ",
          $code({}, "onchange"),
          " props on ",
          $code({}, "Input"),
          " / ",
          $code({}, "TextArea"),
          " receive standard DOM ",
          $code({}, "Event"),
          " objects and do not need manual ",
          $code({}, "oninput: field.onInput"),
          " wiring (the subcomponent handles it automatically).",
        ]),
        $li({}, [
          $strong({}, "Derived Form Validation & Submit State: "),
          "Combine multiple field observables with ",
          $code({}, "mergeValues(() => ..., { parents: [...] })"),
          " to drive submit button ",
          $code({}, "disabled"),
          " state, error banners, and per-field ",
          $code({}, "validationState"),
          " without re-rendering components.",
        ]),
        $li({}, [
          $strong({}, "SSR & Hydration Checklist: "),
          "Wrap page and form components in ",
          $code({}, "createComponent(..., 'Name')"),
          " so observable IDs and lifecycle cleanups stay scoped, and use ",
          $code({}, "hydrate(App, container, hydrationData)"),
          " on the client when server rendering—calling ",
          $code({}, "mount()"),
          " on an SSR-populated container appends a second DOM tree instead of attaching event listeners to the existing markup.",
        ]),
      ]),
    ]),

    CodeBlock({
      language: "typescript",
      code: `import { createComponent, createValue, mergeValues } from "@fimbul-works/seidr";
import { $button, $form } from "@fimbul-works/seidr/html";
import { TextField, createTextField, useTextField } from "@fimbul-works/seidr-ui";

// 1. Tier 1: Unified All-in-One Component (Controlled)
const email = createValue("");
TextField({
  label: "Email Address",
  placeholder: "you@example.com",
  value: email,
  onChange: (val) => email(val), // receives string, not Event
  validationState: email.as((v) => (!v ? undefined : v.includes("@") ? "valid" : "invalid")),
  required: true,
  description: "We will never share your email.",
  errorMessage: "Please enter a valid email.",
});

// 2. Tier 1: Multi-line TextArea with Auto-Resize (Uncontrolled)
TextField({
  label: "Bio",
  multiline: true,
  autoResize: true,
  submitOnEnter: false,
  defaultValue: "Initial content...",
});

// 3. Tier 2: Uncontrolled Fine-Grained Coordinator
const notes = createTextField({ defaultValue: "Draft", required: true });
notes.Root({}, [
  notes.Label({}, "Notes"),
  notes.Input({ placeholder: "Type here..." }),
  notes.Description({}, notes.value.as((v) => \`Characters: \${v.length}\`)),
]);

// 4. Tier 2: Controlled Form Coordination + mergeValues
export const LoginForm = createComponent(() => {
  const username = createValue("");
  const password = createValue("");
  const isLoading = createValue(false);

  const isSubmitDisabled = mergeValues(() => !username() || !password() || isLoading(), {
    parents: [username, password, isLoading],
  });

  // Recommended: pass controlled Value to createTextField({ value })
  const usernameField = createTextField({ id: "login-user", value: username, defaultValue: "", required: true });
  const passwordField = createTextField({ id: "login-pass", value: password, defaultValue: "", required: true });

  return $form({ onsubmit: (e) => e.preventDefault() }, [
    usernameField.Root({}, [
      usernameField.Label({}, "Username"),
      usernameField.Input({ placeholder: "Enter username" }),
    ]),
    passwordField.Root({}, [
      passwordField.Label({}, "Password"),
      passwordField.Input({ type: "password", placeholder: "Enter password" }),
    ]),
    $button({ type: "submit", disabled: isSubmitDisabled }, "Sign In"),
  ]);
}, "LoginForm");

// 5. Tier 3: Headless Hook (Full Markup Control)
const headless = useTextField({ id: "search", defaultValue: "" });
// Spread headless.fieldProps and bind oninput: headless.onInput on any <input>`,
    }),
  ]);
}, "TextFieldShowcase");
