import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Button } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./button.css";

export const ButtonShowcase = createComponent(() => {
  const buttonClicks = createValue(0);
  const isButtonDisabled = createValue(false);

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Button"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p(
      { className: "card-desc" },
      "Accessible button primitive supporting native <button> or custom elements with keyboard triggers (Space / Enter).",
    ),
    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isButtonDisabled.as((d) => `control-btn ${d ? "active" : ""}`),
            onclick: () => isButtonDisabled(!isButtonDisabled()),
          },
          isButtonDisabled.as((d) => (d ? "Enable Buttons" : "Disable Buttons")),
        ),
        $span(
          { style: { fontSize: "0.85rem", color: "var(--fg-muted)" } },
          buttonClicks.as((c) => `Total clicks: ${c}`),
        ),
      ]),
      $div({ style: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" } }, [
        Button(
          {
            className: "btn primary",
            disabled: isButtonDisabled,
            onclick: () => buttonClicks((c) => c + 1),
          },
          "Primary Button",
        ),
        Button(
          {
            className: "btn secondary",
            disabled: isButtonDisabled,
            onclick: () => buttonClicks((c) => c + 1),
          },
          "Secondary",
        ),
        Button(
          {
            className: "btn destructive",
            disabled: isButtonDisabled,
            onclick: () => buttonClicks((c) => c + 1),
          },
          "Destructive",
        ),
        Button(
          {
            as: "div",
            className: "btn secondary",
            disabled: isButtonDisabled,
            onclick: () => buttonClicks((c) => c + 1),
          },
          "Custom <div> Button",
        ),
      ]),
    ]),
    CodeBlock(
      `import { Button } from "@fimbul-works/seidr-ui";

// Standard native button
Button({ onclick: () => alert("Clicked") }, "Click me");

// Non-button element (auto-adds role="button", tabindex="0", and Enter/Space keyboard handlers)
Button({ as: "div", className: "btn" }, "Div Button");

// Reactive disabled state
Button({ disabled: isBusy }, "Submitting...");`,
    ),
  ]);
}, "ButtonShowcase");
