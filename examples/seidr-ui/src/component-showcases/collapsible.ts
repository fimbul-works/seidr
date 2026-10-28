import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Collapsible, createCollapsible } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./collapsible.css";

export const CollapsibleShowcase = createComponent(() => {
  const isControlledOpen = createValue(false);

  // Example 2 using pre-bound instance factory
  const colInstance = createCollapsible({ defaultOpen: true });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Collapsible"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An interactive disclosure widget that toggles the visibility of content, with full WAI-ARIA disclosure attributes and CSS transition support.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "collapsible-showcase" }, [
        // 1. Unified Collapsible Component (uncontrolled)
        $div({ className: "collapsible-box" }, [
          Collapsible({
            trigger: [$span("What is Seidr?"), $span({ className: "collapsible-chevron" }, "▼")],
            triggerProps: { className: "collapsible-trigger-btn" },
            contentProps: { className: "collapsible-panel" },
            children: $p(
              "Seidr is a single-pass fine-grained reactive UI framework. Components execute exactly once to construct the DOM tree, and subsequent state mutations update targeted DOM nodes directly with zero VDOM overhead.",
            ),
          }),
        ]),

        // 2. Pre-bound Instance Factory (createCollapsible) with defaultOpen: true
        $div({ className: "collapsible-box" }, [
          colInstance.Root({}, [
            colInstance.Trigger({ className: "collapsible-trigger-btn" }, [
              $span("Pre-bound Instance Pattern (Collapsible.create)"),
              $span({ className: "collapsible-chevron" }, "▼"),
            ]),
            colInstance.Content(
              { className: "collapsible-panel" },
              $p(
                "Using Collapsible.create() binds Root, Trigger, and Content into a coordinated compound instance with type-safe closures and zero ambient context races.",
              ),
            ),
          ]),
        ]),

        // 3. Controlled Mode with forceMount for CSS Discrete Transitions
        $div({ className: "collapsible-box" }, [
          Collapsible({
            open: isControlledOpen,
            onOpenChange: (open) => isControlledOpen(open),
            forceMount: createValue(true),
            trigger: [
              isControlledOpen.as((o) => (o ? "Hide Advanced Settings" : "Show Advanced Settings")),
              $span({ className: "collapsible-chevron" }, "▼"),
            ],
            triggerProps: { className: "collapsible-trigger-btn" },
            contentProps: { className: "collapsible-panel-animated" },
            children: $p(
              "This panel uses forceMount: true with CSS transition-behavior: allow-discrete, smoothly transitioning opacity and transform while remaining in the DOM.",
            ),
          }),
        ]),

        // 4. Disabled Collapsible
        $div({ className: "collapsible-box" }, [
          Collapsible({
            disabled: true,
            trigger: [$span("🔒 Locked Disclosure (Disabled)"), $span({ className: "collapsible-chevron" }, "▼")],
            triggerProps: { className: "collapsible-trigger-btn" },
            children: $p("Cannot be toggled when disabled."),
          }),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { Collapsible } from "@fimbul-works/seidr-ui";

// 1. Unified All-In-One Helper
Collapsible({
  trigger: "What is Seidr?",
  children: $p("Seidr is a fine-grained reactive framework..."),
});

// 2. Pre-bound Instance Factory
const col = createCollapsible({ defaultOpen: true });

col.Root({}, [
  col.Trigger({}, "Toggle Section"),
  col.Content({}, $p("Collapsible details here...")),
]);

// 3. Force-mounted with CSS transitions
Collapsible({
  open: isOpen,
  forceMount: true,
  trigger: "Advanced Settings",
  children: $p("Animated content..."),
});`,
    ),
  ]);
}, "CollapsibleShowcase");
