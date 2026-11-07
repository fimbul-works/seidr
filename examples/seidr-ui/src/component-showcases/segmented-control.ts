import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createSegmentedControl, SegmentedControl } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./segmented-control.css";

export const SegmentedControlShowcase = createComponent(() => {
  // Global interactive controls
  const isDisabled = createValue(false);

  // Controlled layout state
  const selectedLayout = createValue("grid");
  const layoutDescriptions: Record<string, string> = {
    list: "Detailed single-column list with full metadata.",
    grid: "Multi-column responsive grid card layout.",
    table: "Dense tabular spreadsheet view with sortable columns.",
    kanban: "Column-based drag-and-drop workflow board.",
  };

  // Fine-grained coordinator (Tier 2)
  const customControl = createSegmentedControl({
    defaultValue: "system",
    disabled: isDisabled,
  });

  // Dynamic segments state for Section 5
  const dynamicSegments = createValue([
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ]);
  const dynamicSegmentVal = createValue("daily");
  let nextSegmentId = 1;

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "SegmentedControl"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "A linear, single-selection pill control with an animated sliding indicator, full WAI-ARIA radiogroup semantics, and roving keyboard navigation.",
    ),

    // Live Preview Box
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

      $div({ className: "segmented-control-showcase" }, [
        // 1. All-in-One Component (Tier 1)
        $div({ className: "segmented-control-demo" }, [
          $div({ className: "segmented-control-section-title" }, "1. All-in-One Component (Calendar View)"),
          SegmentedControl({
            defaultValue: "month",
            disabled: isDisabled,
            items: [
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ],
          }),
        ]),

        // 2. Controlled State & Reactive Feedback
        $div({ className: "segmented-control-demo" }, [
          $div({ className: "segmented-control-section-title" }, "2. Controlled State (Layout Mode)"),
          SegmentedControl({
            value: selectedLayout,
            onChange: (val) => selectedLayout(val),
            disabled: isDisabled,
            items: [
              { value: "list", label: "📄 List" },
              { value: "grid", label: "⊞ Grid" },
              { value: "table", label: "▦ Table" },
              { value: "kanban", label: "📋 Kanban" },
            ],
          }),
          $p(
            { className: "card-desc", style: { marginTop: "0.5rem" } },
            selectedLayout.as((layout) => `Active: ${layoutDescriptions[layout] ?? layout}`),
          ),
        ]),

        // 3. Fine-Grained Coordinator (Tier 2) with Custom Markup
        $div({ className: "segmented-control-demo" }, [
          $div(
            { className: "segmented-control-section-title" },
            "3. Fine-Grained Coordinator (createSegmentedControl)",
          ),
          customControl.Root({}, [
            customControl.Indicator({}),
            customControl.Item({ value: "light" }, [$span("☀️ Light")]),
            customControl.Item({ value: "dark" }, [$span("🌙 Dark")]),
            customControl.Item({ value: "system" }, [$span("💻 System")]),
          ]),
        ]),

        // 4. Vertical Orientation
        $div({ className: "segmented-control-demo" }, [
          $div({ className: "segmented-control-section-title" }, "4. Vertical Orientation"),
          SegmentedControl({
            orientation: "vertical",
            defaultValue: "overview",
            disabled: isDisabled,
            items: [
              { value: "overview", label: "Overview" },
              { value: "analytics", label: "Analytics" },
              { value: "reports", label: "Reports" },
              { value: "notifications", label: "Notifications" },
            ],
          }),
        ]),

        // 5. Dynamic Reactive Segments List
        $div({ className: "segmented-control-demo" }, [
          $div({ className: "segmented-control-section-title" }, "5. Dynamic Reactive Segments List"),
          $div({ className: "controls-row", style: { marginBottom: "0.75rem" } }, [
            $button(
              {
                className: "control-btn",
                onclick: () => {
                  const id = nextSegmentId++;
                  dynamicSegments((prev) => [
                    ...prev,
                    {
                      value: `seg-${id}`,
                      label: `Custom-${id}`,
                    },
                  ]);
                },
              },
              "+ Add Segment",
            ),
            $button(
              {
                className: "control-btn",
                onclick: () => {
                  dynamicSegments((prev) => (prev.length > 2 ? prev.slice(0, -1) : prev));
                },
              },
              "- Remove Segment",
            ),
          ]),
          SegmentedControl({
            value: dynamicSegmentVal,
            onChange: (val) => dynamicSegmentVal(val),
            disabled: isDisabled,
            items: dynamicSegments,
          }),
          $p(
            { className: "card-desc", style: { marginTop: "0.5rem" } },
            dynamicSegmentVal.as((val) => `Selected Segment: ${val}`),
          ),
        ]),
      ]),
    ]),

    // Code Documentation
    CodeBlock({
      language: "typescript",
      code: `import { SegmentedControl, createSegmentedControl } from "@fimbul-works/seidr-ui";

// Tier 1: All-in-One Component with Sliding Indicator
SegmentedControl({
  defaultValue: "month",
  items: [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ],
});

// Tier 2: Fine-Grained Coordinator
const sc = createSegmentedControl({ defaultValue: "grid" });
sc.Root({}, [
  sc.Indicator({}),
  sc.Item({ value: "list" }, "List View"),
  sc.Item({ value: "grid" }, "Grid View"),
]);`,
    }),
  ]);
});
