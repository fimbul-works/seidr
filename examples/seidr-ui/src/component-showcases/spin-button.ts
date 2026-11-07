import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { SpinButton } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./spin-button.css";

export const SpinButtonShowcase = createComponent(() => {
  // Controlled Zoom Percentage State (25% - 200%)
  const zoom = createValue(100);

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "SpinButton"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible numeric stepper atom implementing WAI-ARIA spinbutton keyboard navigation. Focus the atom and use ↑ / ↓ arrow keys, PageUp / PageDown, or Home / End to change the value.",
    ),

    // Live Previews
    $div({ className: "preview-box" }, [
      $div({ className: "spin-button-showcase" }, [
        // 1. Uncontrolled with Loop (0 - 10)
        $div({ className: "spin-button-card" }, [
          $span({ className: "spin-button-heading" }, "1. Uncontrolled with Wrap-Around (0 – 10)"),
          $span(
            { className: "spin-button-hint" },
            "Focus and press ↑ / ↓ to step. When hitting 10 or 0, the value rolls around (loop: true).",
          ),
          SpinButton({
            defaultValue: 5,
            minValue: 0,
            maxValue: 10,
            loop: true,
            "aria-label": "Quantity counter",
          }),
        ]),

        // 2. Controlled Zoom Percentage (25% - 200%)
        $div({ className: "spin-button-card" }, [
          $span({ className: "spin-button-heading" }, "2. Controlled with Formatting & Large Steps"),
          $span(
            { className: "spin-button-hint" },
            "Press ↑ / ↓ for ±10%, PageUp / PageDown for ±50%, Home for 25%, End for 200%.",
          ),
          SpinButton({
            value: zoom,
            valueText: zoom.as((z) => `${z}%`),
            minValue: 25,
            maxValue: 200,
            step: 10,
            largeStep: 50,
            onChange: (next) => zoom(next),
            "aria-label": "Zoom level",
          }),
        ]),

        // 3. Disabled SpinButton
        $div({ className: "spin-button-card" }, [
          $span({ className: "spin-button-heading" }, "3. Disabled State"),
          $span({ className: "spin-button-hint" }, "Focus and keyboard navigation are blocked."),
          SpinButton({
            value: 0,
            disabled: true,
            "aria-label": "Disabled counter",
          }),
        ]),
      ]),
    ]),

    CodeBlock({
      language: "typescript",
      code: `import { SpinButton } from "@fimbul-works/seidr-ui";
import { createValue } from "@fimbul-works/seidr";

// 1. Uncontrolled with wrap-around (loop: true)
SpinButton({
  defaultValue: 5,
  minValue: 0,
  maxValue: 10,
  loop: true,
  "aria-label": "Quantity counter",
});

// 2. Controlled state with custom formatted valueText & page steps
const zoom = createValue(100);

SpinButton({
  value: zoom,
  valueText: zoom.as(z => \`\${z}%\`),
  minValue: 25,
  maxValue: 200,
  step: 10,
  largeStep: 50,
  onChange: (next) => zoom(next),
  "aria-label": "Zoom level",
});`,
    }),
  ]);
}, "SpinButtonShowcase");
