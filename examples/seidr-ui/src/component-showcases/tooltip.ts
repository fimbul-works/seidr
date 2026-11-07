import { createComponent, getDocument } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createTooltip, Tooltip } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./tooltip.css";

export const TooltipShowcase = createComponent(() => {
  const customTip = createTooltip({
    id: "tier2-custom-tooltip",
    placement: "right",
    gutter: 10,
    openDelay: 200,
    closeDelay: 150,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Tooltip"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible floating hint element positioned with Popper. Supports WAI-ARIA role='tooltip', keyboard focus and pointer hover triggers, delay warmup and skip-delay group sharing, escape-key dismissal, safe-area polygons, and portaling.",
    ),

    $div({ className: "preview-box" }, [
      $div({ className: "tooltip-showcase" }, [
        // Section 1: Standard Placements
        $div({ className: "tooltip-section-box" }, [
          $h3({ className: "tooltip-heading" }, "Tier 1: Multi-Directional Placements & Arrows"),
          $p({ className: "tooltip-desc" }, "All-in-One Tooltip instances with automatic Popper positioning and arrows."),
          $div({ className: "tooltip-row" }, [
            Tooltip({
              id: "tip-top",
              placement: "top",
              showArrow: true,
              trigger: "Top Placement",
              content: "Tooltip on Top with Arrow",
            }),
            Tooltip({
              id: "tip-bottom",
              placement: "bottom",
              showArrow: true,
              trigger: "Bottom Placement",
              content: "Tooltip on Bottom with Arrow",
            }),
            Tooltip({
              id: "tip-left",
              placement: "left",
              showArrow: true,
              trigger: "Left Placement",
              content: "Tooltip on Left with Arrow",
            }),
            Tooltip({
              id: "tip-right",
              placement: "right",
              showArrow: true,
              trigger: "Right Placement",
              content: "Tooltip on Right with Arrow",
            }),
          ]),
        ]),

        // Section 2: Toolbar with Warmup & Skip-Delay Group Sharing
        $div({ className: "tooltip-section-box" }, [
          $h3({ className: "tooltip-heading" }, "Toolbar: Warmup & Skip-Delay Group"),
          $p(
            { className: "tooltip-desc" },
            "Hover the first icon to trigger the initial 600ms openDelay. Once warmed up, moving directly to adjacent icons skips the delay and displays the tooltip instantly without hesitation.",
          ),
          $div({ className: "tooltip-toolbar" }, [
            Tooltip({
              id: "tb-cut",
              openDelay: 600,
              closeDelay: 250,
              skipDelayDuration: 400,
              showArrow: true,
              triggerProps: { className: "tooltip-icon-btn", ariaLabel: "Cut" },
              trigger: "✂️",
              content: "Cut (Ctrl+X)",
            }),
            Tooltip({
              id: "tb-copy",
              openDelay: 600,
              closeDelay: 250,
              skipDelayDuration: 400,
              showArrow: true,
              triggerProps: { className: "tooltip-icon-btn", ariaLabel: "Copy" },
              trigger: "📄",
              content: "Copy (Ctrl+C)",
            }),
            Tooltip({
              id: "tb-paste",
              openDelay: 600,
              closeDelay: 250,
              skipDelayDuration: 400,
              showArrow: true,
              triggerProps: { className: "tooltip-icon-btn", ariaLabel: "Paste" },
              trigger: "📋",
              content: "Paste (Ctrl+V)",
            }),
            Tooltip({
              id: "tb-undo",
              openDelay: 600,
              closeDelay: 250,
              skipDelayDuration: 400,
              showArrow: true,
              triggerProps: { className: "tooltip-icon-btn", ariaLabel: "Undo" },
              trigger: "↩️",
              content: "Undo (Ctrl+Z)",
            }),
            Tooltip({
              id: "tb-redo",
              openDelay: 600,
              closeDelay: 250,
              skipDelayDuration: 400,
              showArrow: true,
              triggerProps: { className: "tooltip-icon-btn", ariaLabel: "Redo" },
              trigger: "↪️",
              content: "Redo (Ctrl+Y)",
            }),
          ]),
        ]),

        // Section 3: Portaled Tooltip escaping overflow: hidden
        $div({ className: "tooltip-section-box" }, [
          $h3({ className: "tooltip-heading" }, "Portaled Tooltip (Escaping Overflow Container)"),
          $p(
            { className: "tooltip-desc" },
            "This container has overflow: hidden. Hovering or focusing the trigger renders the tooltip via Portal into document.body so it floats cleanly outside clipping boundaries.",
          ),
          $div({ className: "tooltip-scroll-container" }, [
            Tooltip({
              id: "tip-portaled",
              placement: "top",
              showArrow: true,
              portalTarget: getDocument().body,
              trigger: "Hover Portaled Trigger",
              content: "Rendered via Portal into document.body (not clipped!)",
            }),
          ]),
        ]),

        // Section 4: Tier 2 Fine-Grained Composition
        $div({ className: "tooltip-section-box" }, [
          $h3({ className: "tooltip-heading" }, "Tier 2: Fine-Grained createTooltip"),
          $p(
            { className: "tooltip-desc" },
            "Composed explicitly with custom.Root, custom.Trigger, custom.Content, and custom.Arrow.",
          ),
          $div({ className: "tooltip-row" }, [
            customTip.Root({}, [
              customTip.Trigger({}, "Tier 2 Trigger"),
              customTip.Content({}, [
                $div([
                  $span({ style: { fontWeight: "bold", display: "block" } }, "Fine-Grained Coordinator"),
                  $span({ style: { fontSize: "0.75rem", opacity: "0.85" } }, "Full DOM sculpt control"),
                ]),
                customTip.Arrow(),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock({
      code: `// Tier 1: All-in-One Accessible Tooltip
Tooltip({
  id: "copy-tooltip",
  placement: "top",
  showArrow: true,
  portalTarget: getDocument().body,
  openDelay: 500,
  trigger: "Copy Link",
  content: "Copy shareable URL to clipboard",
});

// Tier 2: Fine-Grained Composition
const tip = createTooltip({ placement: "right", gutter: 10 });

tip.Root({}, [
  tip.Trigger({}, "Action"),
  tip.Content({}, [
    "Helpful descriptive tip",
    tip.Arrow(),
  ]),
]);`,
      language: "typescript",
    }),
  ]);
}, "TooltipShowcase");

