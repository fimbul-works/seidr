import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Button } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import ArrowRightIcon from "../icons/arrow-right.svg";
import CheckIcon from "../icons/check.svg";
import GearIcon from "../icons/gear.svg";
import HeartIcon from "../icons/heart.svg";
import SparkleIcon from "../icons/sparkle.svg";
import "./icon.css";

export const IconShowcase = createComponent(() => {
  const isLiked = createValue(false);
  const isSpinning = createValue(false);
  const iconColor = createValue("#3b82f6");

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "SVG Icons"),
      $span({ className: "card-badge" }, "Asset Loader"),
    ]),
    $p(
      { className: "card-desc" },
      "Zero-wrapper native SVG icon loader. SVGs import directly as first-class Seidr element factories with full support for reactive attributes, styles, classes, and event listeners.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isSpinning.as((s) => `control-btn ${s ? "active" : ""}`),
            onclick: () => isSpinning(!isSpinning()),
          },
          isSpinning.as((s) => (s ? "Stop Spinning" : "Spin Gear")),
        ),
        $button(
          {
            className: "control-btn",
            onclick: () => {
              const current = iconColor();
              const nextIndex = (colors.indexOf(current) + 1) % colors.length;
              iconColor(colors[nextIndex]);
            },
          },
          "Cycle Color",
        ),
      ]),

      $div({ className: "icon-demo-grid" }, [
        // Basic Icon
        $div({ className: "icon-demo-item" }, [
          CheckIcon({ className: "icon-preview", style: { width: "32px", height: "32px", color: "#10b981" } }),
          $span({ className: "icon-demo-label" }, "Check"),
        ]),

        // Interactive Reactive Icon
        $div({ className: "icon-demo-item" }, [
          HeartIcon({
            className: isLiked.as((l) => `icon-preview clickable ${l ? "liked" : ""}`),
            style: {
              width: "32px",
              height: "32px",
              cursor: "pointer",
              color: isLiked.as((l) => (l ? "#ef4444" : "var(--fg-muted)")),
              transition: "transform 0.2s ease, color 0.2s ease",
              transform: isLiked.as((l) => (l ? "scale(1.2)" : "scale(1)")),
            },
            onclick: () => isLiked(!isLiked()),
          }),
          $span(
            { className: "icon-demo-label" },
            isLiked.as((l) => (l ? "Liked! ❤️" : "Click me")),
          ),
        ]),

        // Animated / Dynamic Props
        $div({ className: "icon-demo-item" }, [
          GearIcon({
            className: isSpinning.as((s) => `icon-preview ${s ? "spinning" : ""}`),
            style: {
              width: "32px",
              height: "32px",
              color: iconColor.as((c) => c),
              transition: "color 0.3s ease",
            },
          }),
          $span({ className: "icon-demo-label" }, "Gear (Dynamic)"),
        ]),

        // Sparkle
        $div({ className: "icon-demo-item" }, [
          SparkleIcon({
            className: "icon-preview",
            style: { width: "32px", height: "32px", color: "#f59e0b" },
          }),
          $span({ className: "icon-demo-label" }, "Sparkle"),
        ]),

        // Arrow Right
        $div({ className: "icon-demo-item" }, [
          ArrowRightIcon({
            className: "icon-preview",
            style: { width: "32px", height: "32px", color: "var(--fg-default)" },
          }),
          $span({ className: "icon-demo-label" }, "Arrow Right"),
        ]),
      ]),

      // Combined with Button
      $div({ style: { display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" } }, [
        Button({ className: "primary", style: { display: "inline-flex", alignItems: "center", gap: "0.5rem" } }, [
          CheckIcon({ style: { width: "18px", height: "18px" } }),
          "Confirm Order",
        ]),
        Button({ className: "secondary", style: { display: "inline-flex", alignItems: "center", gap: "0.5rem" } }, [
          GearIcon({ style: { width: "18px", height: "18px" } }),
          "Settings",
        ]),
        Button({ className: "secondary", style: { display: "inline-flex", alignItems: "center", gap: "0.5rem" } }, [
          "Continue",
          ArrowRightIcon({ style: { width: "18px", height: "18px" } }),
        ]),
      ]),
    ]),

    CodeBlock({
      language: "typescript",
      code: `// 1. Direct SVG import — transforms to a Seidr SVG element factory!
import CheckIcon from "./icons/check.svg";
import GearIcon from "./icons/gear.svg";

// 2. Render as zero-wrapper native SVG element
CheckIcon({ className: "w-5 h-5 text-emerald-500" });

// 3. Full reactivity: styles, classes, and event listeners
GearIcon({
  className: isSpinning.as((s) => s ? "spinning" : ""),
  style: { color: themeColor },
  onclick: () => openSettings(),
});

// 4. Compose directly into Button or Link children
Button({ className: "primary" }, [
  CheckIcon({ style: { width: "18px", height: "18px" } }),
  "Confirm",
]);`,
    }),
  ]);
}, "IconShowcase");
