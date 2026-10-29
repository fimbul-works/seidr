import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { easeOutBack } from "@fimbul-works/flaedi";
import { Accordion, createAccordion } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./accordion.css";

export const AccordionShowcase = createComponent(() => {
  const controlledKeys = createValue<string[]>(["faq-1"]);

  // Fine-grained instance
  const fineGrainedAccordion = createAccordion({
    collapsible: true,
    defaultValue: ["item-1"],
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Accordion"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "A vertically stacked set of interactive disclosure headings that each reveal an associated section of content. Implements full WAI-ARIA Accordion roles, arrow key roving navigation, and smooth Flaedi tween animations via wrapValueObject.",
    ),

    // Live Previews
    $div({ className: "preview-box" }, [
      $div({ className: "accordion-showcase-section" }, [
        // 1. Basic Accordion (All-in-One)
        $div({ className: "accordion-example-group" }, [
          $h3({ className: "accordion-example-title" }, "1. Single Expansion (Default)"),
          $p(
            { className: "accordion-example-desc" },
            "Only one section can be open at a time. Once opened, clicking the active trigger keeps it open.",
          ),
          Accordion({
            defaultValue: ["item-1"],
            items: [
              {
                value: "item-1",
                trigger: [$span("What is Seidr UI?"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p(
                  "Seidr UI is a headless, fully accessible component library built natively for Seidr's fine-grained reactive runtime. It provides strict WAI-ARIA semantics without framework lock-in or synthetic DOM wrappers.",
                ),
              },
              {
                value: "item-2",
                trigger: [
                  $span("How does reactive data-binding work?"),
                  $span({ className: "accordion-chevron" }, "▼"),
                ],
                content: $p(
                  "Components execute once during initialization. Signals and derived values directly mutate individual DOM attributes and text nodes without virtual DOM diffing or re-rendering whole trees.",
                ),
              },
              {
                value: "item-3",
                trigger: [$span("Is it accessible?"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p(
                  "Yes! Accordion implements full WAI-ARIA disclosure patterns, linking aria-controls and aria-labelledby with automated deterministic IDs, plus arrow key roving focus navigation (ArrowDown, ArrowUp, Home, End).",
                ),
              },
            ],
          }),
        ]),

        // 2. Multi-Expansion Accordion
        $div({ className: "accordion-example-group" }, [
          $h3({ className: "accordion-example-title" }, "2. Multi-Expansion Mode (multiple: true)"),
          $p(
            { className: "accordion-example-desc" },
            "Allows any number of accordion panels to be opened and closed independently.",
          ),
          Accordion({
            multiple: true,
            defaultValue: ["billing", "security"],
            items: [
              {
                value: "account",
                trigger: [$span("Account Preferences"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p(
                  "Manage profile credentials, email notifications, language preferences, and personal display settings.",
                ),
              },
              {
                value: "billing",
                trigger: [$span("Billing & Invoices"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p(
                  "View current tier subscription, download past tax receipts, and update corporate payment cards.",
                ),
              },
              {
                value: "security",
                trigger: [$span("Security & Keys"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p(
                  "Configure hardware FIDO2 2FA security keys, OAuth tokens, and audit session activity logs.",
                ),
              },
            ],
          }),
        ]),

        // 3. Collapsible Single Mode (collapsible: true)
        $div({ className: "accordion-example-group" }, [
          $h3({ className: "accordion-example-title" }, "3. Collapsible Mode (collapsible: true)"),
          $p(
            { className: "accordion-example-desc" },
            "Single expansion mode where clicking the active trigger collapses it, allowing all panels to be closed.",
          ),
          Accordion({
            collapsible: true,
            defaultValue: ["q1"],
            items: [
              {
                value: "q1",
                trigger: [$span("Can I close the active panel?"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p(
                  "Yes, passing collapsible: true allows clicking an open trigger to collapse it back to 0 open items.",
                ),
              },
              {
                value: "q2",
                trigger: [$span("Does it support disabled items?"), $span({ className: "accordion-chevron" }, "▼")],
                disabled: true,
                content: $p("This content cannot be opened because the trigger is disabled."),
              },
            ],
          }),
        ]),

        // 4. Fine-Grained Coordinator (createAccordion)
        $div({ className: "accordion-example-group" }, [
          $h3({ className: "accordion-example-title" }, "4. Fine-Grained Tier 2 (createAccordion)"),
          $p(
            { className: "accordion-example-desc" },
            "Fine-grained DOM sculpting with pre-bound compound element helpers and keyframe slide animations.",
          ),
          fineGrainedAccordion.Root({}, [
            fineGrainedAccordion.Item({
              value: "item-1",
              trigger: [$span("Pre-Bound Item Helper 1"), $span({ className: "accordion-chevron" }, "▼")],
              content: $p(
                "Fine-grained Tier 2 coordinator provides Root, Item, Header, Trigger, Content, and createItem helpers.",
              ),
            }),
            fineGrainedAccordion.Item({
              value: "item-2",
              trigger: [$span("Pre-Bound Item Helper 2"), $span({ className: "accordion-chevron" }, "▼")],
              content: $p(
                "Smooth slide animations run using CSS keyframes targeting --seidr-accordion-content-height.",
              ),
            }),
          ]),
        ]),

        // 5. Controlled Mode
        $div({ className: "accordion-example-group" }, [
          $h3({ className: "accordion-example-title" }, "5. Controlled Reactive Mode"),
          $p({ className: "accordion-example-desc" }, [
            "Active key: ",
            $span(
              { style: { fontWeight: "600", color: "var(--primary, #3b82f6)" } },
              controlledKeys.as((keys) => keys.join(", ") || "None (all collapsed)"),
            ),
          ]),
          Accordion({
            value: controlledKeys,
            collapsible: true,
            onChange: (keys) => controlledKeys(keys),
            items: [
              {
                value: "faq-1",
                trigger: [$span("Controlled Item 1"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p("Controlled directly by a Seidr Value<string[]> signal."),
              },
              {
                value: "faq-2",
                trigger: [$span("Controlled Item 2"), $span({ className: "accordion-chevron" }, "▼")],
                content: $p("State mutations automatically update trigger aria-expanded and panel visibility."),
              },
            ],
          }),
        ]),

        // 6. Custom Flaedi Interpolation (duration: 400ms, easeOutBack)
        $div({ className: "accordion-example-group" }, [
          $h3({ className: "accordion-example-title" }, "6. Custom Flaedi Easing (duration: 400ms, easeOutBack)"),
          $p(
            { className: "accordion-example-desc" },
            "Demonstrates custom spring-like interpolation using Flaedi's easeOutBack curve over 400ms.",
          ),
          Accordion({
            collapsible: true,
            animation: {
              duration: 400,
              easing: easeOutBack,
            },
            items: [
              {
                value: "spring-1",
                trigger: [
                  $span("Flaedi Spring Animation (easeOutBack)"),
                  $span({ className: "accordion-chevron" }, "▼"),
                ],
                content: $p(
                  "Flaedi interpolates height using wrapValueObject proxying the reactive observable directly into rAF deltas with zero layout lag.",
                ),
              },
            ],
          }),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { Accordion, createAccordion } from "@fimbul-works/seidr-ui";

// 1. Tier 1 All-In-One Component
Accordion({
  defaultValue: ["item-1"],
  items: [
    { value: "item-1", trigger: "Question 1", content: "Answer 1" },
    { value: "item-2", trigger: "Question 2", content: "Answer 2" },
  ],
});

// 2. Multi-Expansion Accordion
Accordion({
  multiple: true,
  defaultValue: ["tab-1", "tab-2"],
  items: [ ... ],
});

// 3. Fine-Grained Coordinator (createAccordion)
const accordion = createAccordion({ collapsible: true });

accordion.Root({}, [
  accordion.Item({
    value: "item-1",
    trigger: "Custom Trigger Header",
    content: "Custom Content Region",
  }),
]);

// 4. Custom Flaedi Easing & Duration
import { easeOutBack } from "@fimbul-works/flaedi";

Accordion({
  animation: { duration: 400, easing: easeOutBack },
  items: [ ... ],
});`,
    ),
  ]);
}, "AccordionShowcase");
