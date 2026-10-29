import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Button, createProgress, Progress } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./progress.css";

export const ProgressShowcase = createComponent(() => {
  // Dynamic reactive progress state for interactive demo
  const interactiveValue = createValue(35);

  const increment = () => {
    interactiveValue((prev) => Math.min(prev + 15, 100));
  };

  const reset = () => {
    interactiveValue(0);
  };

  // Fine-grained coordinator for Section 4
  const fineGrained = createProgress({
    value: 68,
    minValue: 0,
    maxValue: 100,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Progress"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "Displays an indicator showing the completion status of a task or operation. Supports determinate and indeterminate states, dynamic percentage formatting, accessible labels, and semantic CSS state bindings.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "progress-showcase" }, [
        // 1. Interactive Dynamic Progress
        $div({ className: "progress-showcase-section" }, [
          $h3({ className: "progress-showcase-heading" }, "1. Interactive Controlled Progress"),
          Progress({
            id: "interactive-progress",
            value: interactiveValue,
            label: "Uploading archive...",
            valueLabel: true,
          }),
          $div({ style: { display: "flex", gap: "0.5rem", marginTop: "0.5rem" } }, [
            Button({ onclick: increment }, "+15% Progress"),
            Button({ onclick: reset }, "Reset"),
          ]),
        ]),

        // 2. Custom Formatter (Items count)
        $div({ className: "progress-showcase-section" }, [
          $h3({ className: "progress-showcase-heading" }, "2. Custom Label Formatter"),
          Progress({
            id: "batch-progress",
            value: 7,
            minValue: 0,
            maxValue: 10,
            label: "Batch Ingestion",
            valueLabel: true,
            getValueLabel: ({ value, max }) => `${value} of ${max} items`,
          }),
        ]),

        // 3. Indeterminate Progress
        $div({ className: "progress-showcase-section" }, [
          $h3({ className: "progress-showcase-heading" }, "3. Indeterminate State"),
          Progress({
            id: "indeterminate-progress",
            indeterminate: true,
            label: "Connecting to gateway...",
          }),
        ]),

        // 4. Fine-Grained Coordinator (createProgress)
        $div({ className: "progress-showcase-section" }, [
          $h3({ className: "progress-showcase-heading" }, "4. Fine-Grained Coordinator (createProgress)"),
          fineGrained.Root({}, [
            fineGrained.Header({}, [
              fineGrained.Label({}, "Disk Verification"),
              fineGrained.ValueLabel({}),
            ]),
            fineGrained.Track({}, [fineGrained.Fill({})]),
          ]),
        ]),
      ]),
    ]),

    // Usage Examples
    CodeBlock(
      `import { createProgress, Progress } from "@fimbul-works/seidr-ui";

// 1. All-in-One Component (Tier 1)
Progress({
  value: 65,
  label: "Syncing data...",
  valueLabel: true,
});

// Indeterminate progress
Progress({
  indeterminate: true,
  label: "Loading resources...",
});

// 2. Fine-Grained Coordinator (Tier 2)
const progress = createProgress({
  value: currentProgress,
  getValueLabel: ({ value }) => \`\${value}%\`,
});

progress.Root({}, [
  progress.Label({}, "Analyzing code..."),
  progress.ValueLabel({}),
  progress.Track({}, [
    progress.Fill({}),
  ]),
]);`,
    ),
  ]);
}, "ProgressShowcase");
