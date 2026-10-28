import { createComponent, createValue, mergeValues } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Checkbox } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./checkbox.css";

export const CheckboxShowcase = createComponent(() => {
  // --- Section 2: Tri-State Parent/Child Indeterminate State ---
  const item1 = createValue(true);
  const item2 = createValue(false);
  const item3 = createValue(true);

  const allChecked = mergeValues(() => item1() && item2() && item3(), { parents: [item1, item2, item3] });

  const someChecked = mergeValues(() => (item1() || item2() || item3()) && !(item1() && item2() && item3()), {
    parents: [item1, item2, item3],
  });

  const toggleAll = (checked: boolean) => {
    item1(checked);
    item2(checked);
    item3(checked);
  };

  // --- Section 3: Validation State ---
  const agreedToTerms = createValue(false);
  const termsValidation = agreedToTerms.as((agreed) => (agreed ? "valid" : "invalid"));

  // Checkbox.create instance pattern for the terms agreement
  const termsCheckbox = Checkbox.create({
    id: "terms-checkbox",
    checked: agreedToTerms,
    onChange: (val: boolean) => agreedToTerms(val),
    required: true,
    validationState: termsValidation,
  });

  // --- Section 4: Interactive Disabling ---
  const isDisabled = createValue(false);

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Checkbox"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "Accessible multi-state toggle control supporting binary (checked/unchecked) and tri-state (indeterminate) states, integrated seamlessly with the FormControl ARIA engine.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isDisabled.as((d) => `control-btn ${d ? "active" : ""}`),
            onclick: () => isDisabled(!isDisabled()),
          },
          isDisabled.as((d) => (d ? "Enable Controls" : "Disable Controls")),
        ),
      ]),

      $div({ className: "checkbox-showcase" }, [
        // 1. All-in-One Unified Checkbox
        $div({ className: "checkbox-group-demo" }, [
          $div({ className: "checkbox-section-title" }, "1. Unified Helper"),
          Checkbox({
            className: "checkbox-root",
            inputProps: { className: "checkbox-input" },
            controlProps: { className: "checkbox-control" },
            indicatorProps: { className: "checkbox-indicator" },
            labelProps: { className: "checkbox-label" },
            descriptionProps: { className: "checkbox-description" },
            defaultChecked: true,
            disabled: isDisabled,
            label: "Receive weekly product updates",
            description: "Curated updates about new features, performance improvements, and tips.",
            indicator: "✓",
          }),
        ]),

        // 2. Tri-State / Indeterminate Coordination
        $div({ className: "checkbox-group-demo" }, [
          $div({ className: "checkbox-section-title" }, "2. Tri-State 'Select All' Indeterminate"),
          Checkbox({
            className: "checkbox-root",
            inputProps: { className: "checkbox-input" },
            controlProps: { className: "checkbox-control" },
            indicatorProps: { className: "checkbox-indicator" },
            labelProps: { className: "checkbox-label" },
            checked: allChecked,
            indeterminate: someChecked,
            disabled: isDisabled,
            onChange: toggleAll,
            label: "Notification Channels",
            indicator: someChecked.as((ind) => (ind ? "–" : "✓")),
          }),

          $div({ className: "checkbox-nested-list" }, [
            Checkbox({
              className: "checkbox-root",
              inputProps: { className: "checkbox-input" },
              controlProps: { className: "checkbox-control" },
              indicatorProps: { className: "checkbox-indicator" },
              labelProps: { className: "checkbox-label" },
              checked: item1,
              disabled: isDisabled,
              onChange: (v: boolean) => item1(v),
              label: "Email notifications",
              indicator: "✓",
            }),
            Checkbox({
              className: "checkbox-root",
              inputProps: { className: "checkbox-input" },
              controlProps: { className: "checkbox-control" },
              indicatorProps: { className: "checkbox-indicator" },
              labelProps: { className: "checkbox-label" },
              checked: item2,
              disabled: isDisabled,
              onChange: (v: boolean) => item2(v),
              label: "SMS text alerts",
              indicator: "✓",
            }),
            Checkbox({
              className: "checkbox-root",
              inputProps: { className: "checkbox-input" },
              controlProps: { className: "checkbox-control" },
              indicatorProps: { className: "checkbox-indicator" },
              labelProps: { className: "checkbox-label" },
              checked: item3,
              disabled: isDisabled,
              onChange: (v: boolean) => item3(v),
              label: "Push notifications",
              indicator: "✓",
            }),
          ]),
        ]),

        // 3. Pre-bound Compound Pattern with Validation
        $div({ className: "checkbox-group-demo" }, [
          $div({ className: "checkbox-section-title" }, "3. Compound Elements & Validation"),
          termsCheckbox.Root({ className: "checkbox-root" }, [
            termsCheckbox.Input({ className: "checkbox-input" }),
            termsCheckbox.Control({ className: "checkbox-control" }, [
              termsCheckbox.Indicator({ className: "checkbox-indicator" }, "✓"),
            ]),
            $div({ className: "checkbox-content" }, [
              termsCheckbox.Label({ className: "checkbox-label" }, "I agree to the Terms and Conditions"),
              termsCheckbox.Description(
                { className: "checkbox-description" },
                "You must check this box to submit the form.",
              ),
              termsCheckbox.ErrorMessage(
                { className: "checkbox-error" },
                "You must accept the terms before proceeding.",
              ),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { Checkbox } from "@fimbul-works/seidr-ui";

// 1. All-in-one unified usage
Checkbox({
  label: "Subscribe to newsletter",
  description: "Get updates delivered directly to your inbox.",
  defaultChecked: true,
  indicator: "✓",
});

// 2. Pre-bound compound usage with reactive validation
const cb = Checkbox.create({
  checked: isAgreed,
  onChange: (val) => isAgreed(val),
  required: true,
  validationState: isAgreed.as(v => v ? "valid" : "invalid"),
});

cb.Root([
  cb.Input(),
  cb.Control([cb.Indicator("✓")]),
  cb.Label("I agree to the Terms"),
  cb.ErrorMessage("You must accept the terms before continuing."),
]);`,
    ),
  ]);
}, "CheckboxShowcase");
