import { createComponent, createValue, getDocument } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Combobox, createCombobox } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./combobox.css";

export const ComboboxShowcase = createComponent(() => {
  // Reactive state for single selection
  const singleValue = createValue<string>("apple");

  // Reactive state for dynamic runtime options
  const runtimeOptions = createValue([
    { value: "rust", label: "Rust" },
    { value: "typescript", label: "TypeScript" },
    { value: "zig", label: "Zig" },
    { value: "go", label: "Go" },
  ]);

  // Tier 2 Fine-Grained Coordinator with grouping sections
  const customCb = createCombobox({
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
      $h2({ className: "card-title" }, "Combobox"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An autocomplete search input combining an editable text box with a floating listbox dropdown positioned via Popper. Fully accessible according to WAI-ARIA 1.2 Combobox specification.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "combobox-showcase" }, [
        // 1. Single Selection with Dynamic Search
        $div({ className: "combobox-section-box" }, [
          $h3({ className: "combobox-heading" }, "1. Autocomplete Search (Tier 1 All-in-One)"),
          Combobox({
            label: "Favorite Fruit",
            placeholder: "Search fruits...",
            value: singleValue,
            onChange: (val: any) => singleValue(val?.value ?? val),
            indicator: "✓",
            options: [
              { value: "apple", label: "Apple" },
              { value: "banana", label: "Banana" },
              { value: "blueberry", label: "Blueberry" },
              { value: "cherry", label: "Cherry" },
              { value: "mango", label: "Mango" },
              { value: "orange", label: "Orange" },
              { value: "strawberry", label: "Strawberry" },
            ],
          }),
          $p(
            { className: "combobox-value-text" },
            singleValue.as((v) => `Selected Value: ${v}`),
          ),
        ]),

        // 2. Dynamic Runtime Option Modifications
        $div({ className: "combobox-section-box" }, [
          $h3({ className: "combobox-heading" }, "2. Dynamic Reactive Options"),
          $div({ className: "controls-row", style: { marginBottom: "0.75rem" } }, [
            $button(
              {
                className: "control-btn",
                onclick: () => {
                  const id = Math.random().toString(36).substring(2, 6);
                  runtimeOptions((prev) => [...prev, { value: id, label: `Lang-${id}` }]);
                },
              },
              "+ Add Option",
            ),
            $button(
              {
                className: "control-btn",
                onclick: () => {
                  runtimeOptions((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
                },
              },
              "- Remove Option",
            ),
          ]),
          Combobox({
            label: "Programming Language",
            placeholder: "Search language...",
            options: runtimeOptions,
            indicator: "✓",
          }),
        ]),

        // 3. Fine-Grained Coordinator (Tier 2) with Sections
        $div({ className: "combobox-section-box" }, [
          $h3({ className: "combobox-heading" }, "3. Fine-Grained Coordinator (Tier 2) with Sections"),
          customCb.Root({}, [
            customCb.Label({}, "Theme Preset"),
            customCb.Control({}, [
              customCb.Input({ placeholder: "Filter themes..." }),
              customCb.Trigger({}, [customCb.Icon({}, "▼")]),
            ]),
            customCb.Content({}, [
              customCb.Listbox(
                {},
                customCb.List(customCb.displayedOptions, {
                  indicator: "✓",
                }),
              ),
            ]),
            customCb.HiddenSelect(),
          ]),
        ]),

        // 4. Portaled Dropdown (Escaping overflow: hidden)
        $div({ className: "combobox-section-box" }, [
          $h3({ className: "combobox-heading" }, "4. Portaled Content (portalTarget: document.body)"),
          $div(
            {
              style: {
                overflow: "hidden",
                border: "1px dashed hsla(210, 100%, 60%, 0.45)",
                borderRadius: "8px",
                padding: "0.75rem",
              },
            },
            [
              Combobox({
                label: "Inside overflow: hidden container",
                placeholder: "Search shader uniforms...",
                portalTarget: getDocument().body,
                indicator: "✓",
                options: [
                  { value: "iResolution", label: "vec3 iResolution" },
                  { value: "iTime", label: "float iTime" },
                  { value: "iTimeDelta", label: "float iTimeDelta" },
                  { value: "iMouse", label: "vec4 iMouse" },
                ],
              }),
            ],
          ),
        ]),
      ]),
    ]),

    // Code Snippets
    $div({ className: "code-box" }, [
      CodeBlock({
        code: `import { Combobox, createCombobox } from "@fimbul-works/seidr-ui";

// Tier 1: All-in-One Autocomplete
Combobox({
  label: "Favorite Fruit",
  placeholder: "Search fruits...",
  options: [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ],
  onChange: (val) => console.log("Selected:", val),
});

// Tier 2: Fine-Grained Coordinator
const cb = createCombobox({ options });

cb.Root({}, [
  cb.Label({}, "Search"),
  cb.Control({}, [
    cb.Input({ placeholder: "Type to filter..." }),
    cb.Trigger({}, [cb.Icon({}, "▼")]),
  ]),
  cb.Content({}, [
    cb.Listbox({}, cb.List(cb.displayedOptions)),
  ]),
]);`,
        language: "typescript",
      }),
    ]),
  ]);
});

