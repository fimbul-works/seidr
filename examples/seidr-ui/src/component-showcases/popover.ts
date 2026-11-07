import { createComponent, createValue, getDocument } from "@fimbul-works/seidr";
import { $button, $div, $form, $h2, $h3, $input, $label, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createPopover, Popover } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./popover.css";

export const PopoverShowcase = createComponent(() => {
  // Tier 2 Popover with separate custom Anchor element
  const anchorPopover = createPopover({
    id: "popover-anchor-demo",
    placement: "bottom-start",
    showArrow: true,
  });

  // State for form demo
  const widthVal = createValue("100%");
  const heightVal = createValue("250px");

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Popover"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible floating overlay container anchored to a trigger or custom element. Features WAI-ARIA role='dialog', automatic focus management and focus trapping, outside pointer and escape dismissal, and full positioning via Popper.",
    ),

    $div({ className: "preview-box" }, [
      $div({ className: "popover-showcase" }, [
        // Section 1: Tier 1 Standard Popover
        $div({ className: "popover-section-box" }, [
          $h3({ className: "popover-heading" }, "Tier 1: All-in-One Popover"),
          $p(
            { className: "popover-desc" },
            "Convenience component with built-in trigger, title, description, close button, and arrow.",
          ),
          $div({ className: "popover-row" }, [
            Popover({
              id: "popover-basic",
              placement: "bottom",
              showArrow: true,
              trigger: "Open Information Popover",
              title: "Layer Details",
              description: "Configuration properties for the currently selected canvas layer.",
              content: $p({ style: "margin: 0; font-size: 0.8125rem; color: #cbd5e1;" }, "Dimensions: 1920x1080 @ 60fps, RGB color space with alpha channel."),
            }),
          ]),
        ]),

        // Section 2: Interactive Focus-Trapped Popover (Form)
        $div({ className: "popover-section-box" }, [
          $h3({ className: "popover-heading" }, "Interactive Modal Popover (Focus Trapped)"),
          $p(
            { className: "popover-desc" },
            "Clicking inside focuses the first input. Tab key is trapped within the popover. Pressing Escape or clicking outside closes it and restores focus to the trigger.",
          ),
          $div({ className: "popover-row" }, [
            Popover({
              id: "popover-dimensions-form",
              placement: "right-start",
              isModal: true,
              showArrow: true,
              trigger: "Change Dimensions 📐",
              title: "Canvas Dimensions",
              description: "Adjust viewport parameters dynamically.",
              content: $form(
                {
                  className: "popover-form",
                  onsubmit: (e) => {
                    e.preventDefault();
                  },
                },
                [
                  $div({ className: "popover-form-row" }, [
                    $label({ for: "canvas-width" }, "Width"),
                    $input({
                      id: "canvas-width",
                      className: "popover-input",
                      value: widthVal,
                      oninput: (e) => widthVal((e.target as HTMLInputElement).value),
                    }),
                  ]),
                  $div({ className: "popover-form-row" }, [
                    $label({ for: "canvas-height" }, "Height"),
                    $input({
                      id: "canvas-height",
                      className: "popover-input",
                      value: heightVal,
                      oninput: (e) => heightVal((e.target as HTMLInputElement).value),
                    }),
                  ]),
                  $button(
                    {
                      type: "button",
                      className: "popover-input",
                      style: "cursor: pointer; background: var(--accent); color: white; border: none; margin-top: 4px;",
                      onclick: () => alert(`Saved dimensions: ${widthVal()} x ${heightVal()}`),
                    },
                    "Apply Changes",
                  ),
                ],
              ),
            }),
          ]),
        ]),

        // Section 3: Tier 2 Fine-Grained with Custom Anchor
        $div({ className: "popover-section-box" }, [
          $h3({ className: "popover-heading" }, "Tier 2: Fine-Grained with Custom Anchor"),
          $p(
            { className: "popover-desc" },
            "The popover content anchors to a dedicated target element (e.g. an icon or status badge) rather than the trigger button itself.",
          ),
          $div({ className: "popover-row" }, [
            anchorPopover.Root({}, [
              anchorPopover.Anchor({}, "🎯 Target Anchor Element"),
              anchorPopover.Trigger({ style: "margin-left: 1rem;" }, "Toggle Anchor Popover"),
              anchorPopover.Content({}, [
                anchorPopover.Arrow(),
                anchorPopover.Title({}, "Anchored Note"),
                anchorPopover.Description({}, "Positioned relative to the target anchor element, not the trigger button."),
                anchorPopover.CloseButton({}, "✕"),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock({
      code: `// Tier 1: All-in-One Popover
Popover({
  id: "popover-basic",
  placement: "bottom",
  showArrow: true,
  trigger: "Open Information Popover",
  title: "Layer Details",
  description: "Configuration properties for the currently selected canvas layer.",
  content: "Dimensions: 1920x1080 @ 60fps...",
});

// Tier 2: Fine-Grained with custom Anchor
const pop = createPopover({ placement: "bottom-start", showArrow: true });

pop.Root({}, [
  pop.Anchor({}, "Target Element"),
  pop.Trigger({}, "Toggle Popover"),
  pop.Content({}, [
    pop.Arrow(),
    pop.Title({}, "Anchored Note"),
    pop.CloseButton({}, "✕"),
  ]),
]);`,
      language: "typescript",
    }),
  ]);
});

