import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createToggleGroup, ToggleGroup } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./toggle-group.css";

export const ToggleGroupShowcase = createComponent(() => {
  // Reactive states for live display
  const alignmentValue = createValue<string | null>("left");
  const formatValues = createValue<string[]>(["bold", "italic"]);
  const viewMode = createValue<string | null>("day");

  // Fine-grained coordinator for Section 4
  const fineGrained = createToggleGroup({
    defaultValue: "month",
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "ToggleGroup"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "A set of two-state buttons that can be toggled on or off. Supports single and multiple selection models, roving arrow-key focus, orientation, and keyboard navigation.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "toggle-group-showcase" }, [
        // 1. Single Selection (Text Alignment)
        $div({ className: "toggle-group-section" }, [
          $h3({ className: "toggle-group-heading" }, "1. Single Selection (Text Alignment)"),
          ToggleGroup({
            id: "alignment-group",
            value: alignmentValue,
            onChange: (val: string | null) => alignmentValue(val),
            disallowEmptySelection: true,
            items: [
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
              { value: "justify", label: "Justify" },
            ],
          }),
          $p({ className: "toggle-group-value" }, [
            "Active alignment: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              alignmentValue.as((v) => v ?? "none"),
            ]),
          ]),
        ]),

        // 2. Multiple Selection (Text Formatting)
        $div({ className: "toggle-group-section" }, [
          $h3({ className: "toggle-group-heading" }, "2. Multiple Selection (Text Styles)"),
          ToggleGroup({
            id: "formatting-group",
            multiple: true,
            value: formatValues,
            onChange: (vals: string[]) => formatValues(vals),
            items: [
              { value: "bold", label: "B" },
              { value: "italic", label: "I" },
              { value: "underline", label: "U" },
              { value: "strikethrough", label: "S", disabled: true },
            ],
          }),
          $p({ className: "toggle-group-value" }, [
            "Active styles: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              formatValues.as((v) => (v.length > 0 ? v.join(", ") : "none")),
            ]),
          ]),
        ]),

        // 3. Vertical Orientation
        $div({ className: "toggle-group-section" }, [
          $h3({ className: "toggle-group-heading" }, "3. Vertical Orientation"),
          ToggleGroup({
            id: "view-mode-group",
            orientation: "vertical",
            value: viewMode,
            onChange: (val: string | null) => viewMode(val),
            items: [
              { value: "day", label: "📅 Day View" },
              { value: "week", label: "📆 Week View" },
              { value: "month", label: "🗓️ Month View" },
            ],
          }),
        ]),

        // 4. Fine-Grained Coordinator (createToggleGroup)
        $div({ className: "toggle-group-section" }, [
          $h3({ className: "toggle-group-heading" }, "4. Fine-Grained Coordinator (createToggleGroup)"),
          fineGrained.Root({}, [
            fineGrained.Item({ value: "day" }, "Day"),
            fineGrained.Item({ value: "week" }, "Week"),
            fineGrained.Item({ value: "month" }, "Month"),
            fineGrained.Item({ value: "year" }, "Year"),
          ]),
          $p({ className: "toggle-group-value" }, [
            "Selected period: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              fineGrained.value.as((v) => String(v ?? "none")),
            ]),
          ]),
        ]),
      ]),
    ]),

    // Usage Examples
    CodeBlock(
      `import { createToggleGroup, ToggleGroup } from "@fimbul-works/seidr-ui";

// 1. Single Selection (Tier 1)
ToggleGroup({
  defaultValue: "left",
  disallowEmptySelection: true,
  items: [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ],
});

// 2. Multiple Selection (Tier 1)
ToggleGroup({
  multiple: true,
  defaultValue: ["bold", "italic"],
  items: [
    { value: "bold", label: "B" },
    { value: "italic", label: "I" },
    { value: "underline", label: "U" },
  ],
});

// 3. Fine-Grained Coordinator (Tier 2)
const group = createToggleGroup({
  defaultValue: "day",
});

group.Root({}, [
  group.Item({ value: "day" }, "Day"),
  group.Item({ value: "week" }, "Week"),
  group.Item({ value: "month" }, "Month"),
]);`,
    ),
  ]);
}, "ToggleGroupShowcase");
