import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $p, $section, $span, $strong } from "@fimbul-works/seidr/html";
import { createNumberField, NumberField } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./number-field.css";

export const NumberFieldShowcase = createComponent(() => {
  // Demo 2: Controlled Raw Numeric Value
  const ratingValue = createValue(7.5);

  // Demo 4: Reactive Validation (even numbers between 2 and 20)
  const validationInput = createValue(10);
  const validationState = validationInput.as((n) => {
    if (Number.isNaN(n) || n < 2 || n > 20 || n % 2 !== 0) {
      return "invalid";
    }
    return "valid";
  });

  // Demo 3: Fine-grained sculpted layout (createNumberField)
  const flankedField = createNumberField({
    defaultValue: 5,
    minValue: 1,
    maxValue: 10,
    step: 1,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "NumberField"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible numeric input coordinating formatted text values, decimal precision, and native spinbutton keyboard navigation (↑/↓, PageUp/PageDown, Home/End, mouse wheel, and stepper buttons).",
    ),

    // Live Previews
    $div({ className: "preview-box" }, [
      $div({ className: "number-field-showcase" }, [
        // 1. Currency & Formatting
        $div({ className: "number-field-card" }, [
          $span({ className: "number-field-heading" }, "1. Currency & Intl.NumberFormat Formatting"),
          $span(
            { className: "number-field-hint" },
            "Formats numeric values into USD currency on blur. Use ↑ / ↓ for ±$50, PageUp / PageDown for ±$250, or mouse wheel while focused.",
          ),
          NumberField({
            defaultValue: 1250,
            minValue: 0,
            maxValue: 10000,
            step: 50,
            largeStep: 250,
            label: "Monthly Budget",
            description: "Enter an amount between $0 and $10,000",
            formatOptions: {
              style: "currency",
              currency: "USD",
            },
          }),
        ]),

        // 2. Controlled Raw Value with Reactive Readout
        $div({ className: "number-field-card" }, [
          $span({ className: "number-field-heading" }, "2. Controlled Raw Value with Live Readout"),
          $span(
            { className: "number-field-hint" },
            "Directly synchronizes with a reactive Value<number>. Step size is 0.5 (large step 2.0).",
          ),
          NumberField({
            rawValue: ratingValue,
            onRawValueChange: (val) => ratingValue(val),
            minValue: 1,
            maxValue: 10,
            step: 0.5,
            largeStep: 2,
            label: "Product Rating",
            description: "Scale of 1.0 to 10.0",
          }),
          $div({ className: "number-field-readout" }, [
            $span({}, "Live Raw Value: "),
            $strong(
              {},
              ratingValue.as((r) => String(r)),
            ),
          ]),
        ]),

        // 3. Fine-Grained Sculpted Composition (createNumberField)
        $div({ className: "number-field-card" }, [
          $span({ className: "number-field-heading" }, "3. Custom Sculpted Layout (createNumberField)"),
          $span(
            { className: "number-field-hint" },
            "Custom layout flanking the input with separate decrement and increment buttons.",
          ),
          flankedField.Root({}, [
            flankedField.Label({}, "Item Quantity"),
            $div({ className: "number-field-flanked-group" }, [
              flankedField.DecrementTrigger({ className: "flanked-btn" }, "−"),
              flankedField.Input({ className: "flanked-input" }),
              flankedField.IncrementTrigger({ className: "flanked-btn" }, "+"),
            ]),
            flankedField.HiddenInput(),
            flankedField.Description({}, "Allowed range: 1 to 10 items"),
          ]),
        ]),

        // 4. Reactive Validation & Error Message
        $div({ className: "number-field-card" }, [
          $span({ className: "number-field-heading" }, "4. Reactive Validation State"),
          $span(
            { className: "number-field-hint" },
            "Requires an even number between 2 and 20. Triggers accessible error message when invalid.",
          ),
          NumberField({
            rawValue: validationInput,
            onRawValueChange: (val) => validationInput(val),
            validationState,
            minValue: 2,
            maxValue: 20,
            step: 1,
            label: "Even Number (2 – 20)",
            description: "Please enter an even integer.",
            errorMessage: "Must be an even number between 2 and 20.",
          }),
        ]),
      ]),
    ]),

    // Usage Examples
    $div({ className: "code-box" }, [
      CodeBlock({
        language: "typescript",
        code: `import { createNumberField, NumberField } from "@fimbul-works/seidr-ui";

// 1. All-in-One Component (Tier 1)
NumberField({
  defaultValue: 1250,
  minValue: 0,
  maxValue: 10000,
  step: 50,
  label: "Monthly Budget",
  description: "Allowed: $0 - $10,000",
  formatOptions: {
    style: "currency",
    currency: "USD",
  },
});

// 2. Fine-Grained Coordinator Pattern (Tier 2)
const nf = createNumberField({ defaultValue: 5, minValue: 1, maxValue: 10 });

nf.Root({}, [
  nf.Label({}, "Quantity"),
  nf.DecrementTrigger({}, "−"),
  nf.Input(),
  nf.IncrementTrigger({}, "+"),
  nf.HiddenInput(),
]);`,
      }),
    ]),
  ]);
});
