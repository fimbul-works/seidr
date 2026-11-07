import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createListbox, Listbox } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./listbox.css";

export const ListboxShowcase = createComponent(() => {
  // Reactive state for single selection
  const singleValue = createValue<string>("solid");

  // Reactive state for multi-selection
  const multiValues = createValue<string[]>(["apple", "banana"]);

  // Tier 2 Fine-Grained Coordinator with grouping sections
  const customLb = createListbox({
    defaultValue: "nordic",
  });
  const sec1Item1 = customLb.createItem({ value: "nordic" });
  const sec1Item2 = customLb.createItem({ value: "cyberpunk" });
  const sec2Item1 = customLb.createItem({ value: "light" });
  const sec2Item2 = customLb.createItem({ value: "high-contrast", disabled: true });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Listbox"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An unportaled selection list allowing single, multiple, or unselectable item states with full WAI-ARIA roving keyboard navigation, typeahead searching, sections, and item indicators.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "listbox-showcase" }, [
        // 1. Single Selection
        $div({ className: "listbox-section-box" }, [
          $h3({ className: "listbox-heading" }, "1. Single Selection (Framework Options)"),
          Listbox({
            ariaLabel: "Select a framework",
            value: singleValue,
            onChange: (val: string) => singleValue(val),
            items: [
              { value: "react", label: "React", description: "Component-based UI library" },
              { value: "solid", label: "SolidJS", description: "Fine-grained reactive signals" },
              { value: "seidr", label: "Seidr", description: "Zero virtual-DOM reactive primitives" },
              { value: "vue", label: "Vue", description: "Progressive framework", disabled: true },
            ],
          }),
          $p({ className: "listbox-value-text" }, [
            "Selected: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [singleValue.as((v) => v ?? "none")]),
          ]),
        ]),

        // 2. Multiple Selection
        $div({ className: "listbox-section-box" }, [
          $h3({ className: "listbox-heading" }, "2. Multiple Selection (Fruits)"),
          Listbox({
            ariaLabel: "Select fruits",
            selectionMode: "multiple",
            value: multiValues,
            onChange: (vals: string[]) => multiValues(vals),
            items: [
              { value: "apple", label: "🍎 Apple" },
              { value: "banana", label: "🍌 Banana" },
              { value: "cherry", label: "🍒 Cherry" },
              { value: "orange", label: "🍊 Orange" },
            ],
          }),
          $p({ className: "listbox-value-text" }, [
            "Selected: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              multiValues.as((vals) => (vals.length > 0 ? vals.join(", ") : "none")),
            ]),
          ]),
        ]),

        // 3. Fine-Grained Coordinator (Tier 2) with Sections
        $div({ className: "listbox-section-box" }, [
          $h3({ className: "listbox-heading" }, "3. Fine-Grained Coordinator with Sections (Tier 2)"),
          customLb.Root({ ariaLabel: "Color Themes" }, [
            customLb.Section({}, [
              customLb.SectionLabel({}, "Dark Themes"),
              sec1Item1.Item({}, [
                sec1Item1.ItemLabel({}, "Nordic Night"),
                sec1Item1.ItemDescription({}, "Cool blue-gray dark theme"),
                sec1Item1.ItemIndicator({}, "✓"),
              ]),
              sec1Item2.Item({}, [
                sec1Item2.ItemLabel({}, "Cyberpunk Neon"),
                sec1Item2.ItemDescription({}, "High-saturation dark theme"),
                sec1Item2.ItemIndicator({}, "✓"),
              ]),
            ]),
            customLb.Section({}, [
              customLb.SectionLabel({}, "Accessibility Themes"),
              sec2Item1.Item({}, [
                sec2Item1.ItemLabel({}, "Pure Light"),
                sec2Item1.ItemDescription({}, "Clean white background"),
                sec2Item1.ItemIndicator({}, "✓"),
              ]),
              sec2Item2.Item({}, [
                sec2Item2.ItemLabel({}, "High Contrast"),
                sec2Item2.ItemDescription({}, "Maximum contrast (disabled)"),
                sec2Item2.ItemIndicator({}, "✓"),
              ]),
            ]),
          ]),
          $p({ className: "listbox-value-text" }, [
            "Selected theme: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              customLb.selectedValues.as((vals) => vals[0] ?? "none"),
            ]),
          ]),
        ]),
      ]),
    ]),

    // Usage Examples
    CodeBlock({
      language: "typescript",
      code: `import { createListbox, Listbox } from "@fimbul-works/seidr-ui";

// 1. All-in-One Component (Tier 1)
Listbox({
  items: [
    { value: "react", label: "React", description: "Component-based UI library" },
    { value: "solid", label: "SolidJS", description: "Fine-grained reactive signals" },
    { value: "seidr", label: "Seidr", description: "Zero virtual-DOM reactive primitives" },
  ],
  defaultValue: "seidr",
  onChange: (value) => console.log("Selected:", value),
});

// 2. Multiple Selection
Listbox({
  selectionMode: "multiple",
  defaultValue: ["apple", "cherry"],
  items: [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ],
  onChange: (values) => console.log("Selected list:", values),
});

// 3. Fine-Grained Coordinator (Tier 2)
const lb = createListbox({ defaultValue: "dark" });
const darkItem = lb.createItem({ value: "dark" });
const lightItem = lb.createItem({ value: "light" });

lb.Root({ ariaLabel: "Theme selection" }, [
  lb.Section({}, [
    lb.SectionLabel({}, "General"),
    darkItem.Item({}, [
      darkItem.ItemLabel({}, "Dark Mode"),
      darkItem.ItemIndicator({}, "✓"),
    ]),
    lightItem.Item({}, [
      lightItem.ItemLabel({}, "Light Mode"),
      lightItem.ItemIndicator({}, "✓"),
    ]),
  ]),
]);`,
    }),
  ]);
}, "ListboxShowcase");
