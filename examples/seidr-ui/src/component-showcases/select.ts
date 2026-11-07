import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createSelect, Select } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./select.css";

export const SelectShowcase = createComponent(() => {
  // Reactive state for single selection
  const singleValue = createValue<string>("solid");

  // Reactive state for multi-selection
  const multiValues = createValue<string[]>(["apple", "banana"]);

  // Tier 2 Fine-Grained Coordinator with grouping sections
  const customSel = createSelect({
    defaultValue: "nordic",
    options: [
      {
        type: "section",
        key: "themes-dark",
        label: "Dark Themes",
        items: [
          { value: "nordic", label: "Nordic Frost" },
          { value: "cyberpunk", label: "Cyberpunk Neon" },
        ],
      },
      {
        type: "section",
        key: "themes-light",
        label: "Light Themes",
        items: [
          { value: "daylight", label: "Pure Daylight" },
          { value: "paper", label: "Vintage Paper" },
        ],
      },
    ],
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Select"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "Displays a list of options for the user to pick from, triggered by a button and positioned floating relative to the trigger via Popper. Fully accessible according to WAI-ARIA 1.2 Combobox / Select-only specification.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "select-showcase" }, [
        // 1. Single Selection
        $div({ className: "select-section-box" }, [
          $h3({ className: "select-heading" }, "1. Single Selection (Tier 1 All-in-One)"),
          Select({
            label: "Frontend Framework",
            placeholder: "Select a framework...",
            value: singleValue,
            onChange: (val: any) => singleValue(val?.value ?? val),
            options: [
              { value: "react", label: "React" },
              { value: "solid", label: "SolidJS" },
              { value: "seidr", label: "Seidr" },
              { value: "vue", label: "Vue.js", disabled: true },
              { value: "svelte", label: "Svelte" },
            ],
          }),
          $p({ className: "select-value-text" }, [
            "Current Value: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              singleValue.as((v) => v ?? "none"),
            ]),
          ]),
        ]),

        // 2. Multiple Selection
        $div({ className: "select-section-box" }, [
          $h3({ className: "select-heading" }, "2. Multiple Selection"),
          Select({
            label: "Grocery List",
            placeholder: "Select fruits...",
            multiple: true,
            value: multiValues,
            onChange: (vals: any[]) => multiValues(vals.map((v) => v?.value ?? v)),
            options: [
              { value: "apple", label: "Apple" },
              { value: "banana", label: "Banana" },
              { value: "cherry", label: "Cherry" },
              { value: "date", label: "Date" },
              { value: "elderberry", label: "Elderberry" },
            ],
          }),
          $p({ className: "select-value-text" }, [
            "Selected Items: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              multiValues.as((vals) => (vals.length > 0 ? vals.join(", ") : "none")),
            ]),
          ]),
        ]),

        // 3. Fine-Grained Coordinator (Tier 2) with Sections
        $div({ className: "select-section-box" }, [
          $h3({ className: "select-heading" }, "3. Grouped Sections (Tier 2 Fine-Grained)"),
          customSel.Root({}, [
            customSel.Label({}, "Theme Preference"),
            customSel.Trigger({}, [customSel.Value(), customSel.Icon()]),
            customSel.Content({}, [
              customSel.Listbox({}, [
                customSel.List(customSel.normalizedOptions, {
                  indicator: "✓",
                }),
              ]),
            ]),
            customSel.HiddenSelect(),
          ]),
        ]),
      ]),
    ]),

    // Code Examples
    CodeBlock({
      code: `// Tier 1: High-level component
import { Select } from "@fimbul-works/seidr-ui";

const framework = createValue("seidr");

Select({
  label: "Framework",
  placeholder: "Choose...",
  value: framework,
  onChange: (val) => framework(val.value),
  options: [
    { value: "seidr", label: "Seidr" },
    { value: "solid", label: "SolidJS" },
  ],
});

// Tier 2: Fine-grained coordinator with dynamic reactive List
import { createSelect } from "@fimbul-works/seidr-ui";

const sel = createSelect({ options: myOptions });

sel.Root({}, [
  sel.Label({}, "Category"),
  sel.Trigger({}, [sel.Value(), sel.Icon()]),
  sel.Content({}, [
    sel.Listbox({}, [
      sel.List(sel.normalizedOptions),
    ]),
  ]),
  sel.HiddenSelect(),
]);`,
      language: "typescript",
    }),
  ]);
});

