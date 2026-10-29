import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createSwitch, Switch } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./switch.css";

export const SwitchShowcase = createComponent(() => {
  // --- Section 2: Controlled Switch ---
  const isDND = createValue(false);

  // --- Section 3: Validation State ---
  const isMaintenance = createValue(false);
  const maintenanceValidation = isMaintenance.as((val) => (val ? "valid" : "invalid"));

  const maintenanceSwitch = createSwitch({
    id: "maintenance-switch",
    checked: isMaintenance,
    onChange: (val: boolean) => isMaintenance(val),
    required: true,
    validationState: maintenanceValidation,
  });

  // --- Section 4: Interactive Disabling ---
  const isDisabled = createValue(false);

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Switch"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "Accessible two-state toggle switch with WAI-ARIA role='switch', aria-checked, and smooth sliding thumb animations, powered by the FormControl engine.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isDisabled.as((d) => `control-btn ${d ? "active" : ""}`),
            onclick: () => isDisabled(!isDisabled()),
          },
          isDisabled.as((d) => (d ? "Enable Switches" : "Disable Switches")),
        ),
      ]),

      $div({ className: "switch-showcase" }, [
        // 1. All-in-One Unified Switch
        $div({ className: "switch-group" }, [
          $div({ className: "switch-section-title" }, "1. Unified Helper"),
          Switch({
            defaultChecked: true,
            disabled: isDisabled,
            label: "Airplane Mode",
            description: "Disable all wireless and cellular connections.",
          }),
        ]),

        // 2. Controlled Switch with Reactive State
        $div({ className: "switch-group" }, [
          $div({ className: "switch-section-title" }, "2. Controlled Switch"),
          Switch({
            checked: isDND,
            disabled: isDisabled,
            onChange: (val: boolean) => isDND(val),
            label: "Do Not Disturb",
            description: isDND.as((dnd) =>
              dnd
                ? "🌙 Silence calls and notifications. Incoming alerts are hidden."
                : "🔔 Normal notification alerts are enabled.",
            ),
          }),
        ]),

        // 3. Pre-bound Compound Pattern with Validation
        $div({ className: "switch-group" }, [
          $div({ className: "switch-section-title" }, "3. Compound Elements & Validation"),
          maintenanceSwitch.Root({}, [
            maintenanceSwitch.Input(),
            maintenanceSwitch.Control({}, [maintenanceSwitch.Thumb({})]),
            $div({ className: "switch-content" }, [
              maintenanceSwitch.Label({}, "Enable Maintenance Window"),
              maintenanceSwitch.Description({}, "Activating redirects incoming traffic to the maintenance page."),
              maintenanceSwitch.ErrorMessage({}, "Maintenance must be active before scheduled operations can proceed."),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { Switch } from "@fimbul-works/seidr-ui";

// 1. All-in-one unified usage
Switch({
  label: "Airplane Mode",
  description: "Disable all wireless connections.",
  defaultChecked: true,
});

// 2. Pre-bound compound usage with reactive validation
const sw = Switch.create({
  checked: isEnabled,
  onChange: (val) => isEnabled(val),
  required: true,
  validationState: isEnabled.as(v => v ? "valid" : "invalid"),
});

sw.Root([
  sw.Input(),
  sw.Control([sw.Thumb()]),
  sw.Label("Maintenance Mode"),
  sw.ErrorMessage("Maintenance mode is required."),
]);`,
    ),
  ]);
}, "SwitchShowcase");
