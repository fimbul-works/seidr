import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createSelect, Select } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./select.css";

export const SelectShowcase = createComponent(() => {
  // Reactive state for single selection
  const singleValue = createValue<string>("solid");

  // Reactive state for multi-selection
  const multiValues = createValue<string[]>(["apple", "banana"]);

  // Reactive dynamic options state for Section 4
  const dynamicSelectOptions = createValue([
    { value: "alpha", label: "Alpha Team" },
    { value: "bravo", label: "Bravo Team" },
    { value: "charlie", label: "Charlie Team" },
  ]);
  const dynamicSelectVal = createValue<string>("alpha");
  let nextTeamId = 1;

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

        // 4. Dynamic Reactive Options (Runtime Modifications)
        $div({ className: "select-section-box" }, [
          $h3({ className: "select-heading" }, "4. Dynamic Reactive Options (Runtime Updates)"),
          $div({ className: "controls-row", style: { marginBottom: "0.75rem" } }, [
            $button(
              {
                className: "control-btn",
                onclick: () => {
                  const id = nextTeamId++;
                  dynamicSelectOptions((prev) => [
                    ...prev,
                    {
                      value: `team-${id}`,
                      label: `Team #${id} (${Math.random().toString(36).substring(2, 6)})`,
                    },
                  ]);
                },
              },
              "+ Add Option",
            ),
            $button(
              {
                className: "control-btn",
                onclick: () => {
                  dynamicSelectOptions((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
                },
              },
              "- Remove Option",
            ),
          ]),
          Select({
            label: "Project Assignment",
            placeholder: "Select team...",
            value: dynamicSelectVal,
            onChange: (val: any) => dynamicSelectVal(val?.value ?? val),
            options: dynamicSelectOptions,
          }),
          $p({ className: "select-value-text" }, [
            "Active Team: ",
            $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 65%)" } }, [
              dynamicSelectVal.as((v) => v ?? "none"),
            ]),
            " | Available Teams: ",
            $span({ style: { fontWeight: "600", color: "hsl(142, 71%, 45%)" } }, [
              dynamicSelectOptions.as((opts) => String(opts.length)),
            ]),
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

