import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import {
  createDropdownMenu,
  DropdownMenu,
  type DropdownMenuItemDescriptor,
} from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./dropdown-menu.css";

export const DropdownMenuShowcase = createComponent(() => {
  // Reactive feedback state
  const lastAction = createValue<string>("None");
  const notifications = createValue<boolean>(true);
  const sortOrder = createValue<string>("date");

  // Dynamic items state
  const dynamicItems = createValue<DropdownMenuItemDescriptor[]>([
    { value: "action-1", label: "Quick Action 1", icon: "⚡" },
    { value: "action-2", label: "Quick Action 2", icon: "⭐" },
    { value: "action-3", label: "Quick Action 3", icon: "🚀" },
  ]);
  let nextActionId = 4;

  const addAction = () => {
    const id = nextActionId++;
    dynamicItems((prev) => [
      ...prev,
      { value: `action-${id}`, label: `Quick Action ${id}`, icon: "✨" },
    ]);
  };

  const removeAction = () => {
    dynamicItems((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Tier 2 Coordinator for Section 2
  const customDropdown = createDropdownMenu({ id: "fine-grained-dropdown" });
  const sortRadio = customDropdown.createRadioGroup({
    value: sortOrder,
    onChange: (val) => sortOrder(val),
  });

  // Submenu coordinator for Section 3
  const parentDropdown = createDropdownMenu({ id: "parent-dropdown-demo" });
  const exportSub = parentDropdown.createSub({ id: "export-sub" });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "DropdownMenu"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "Displays a versatile dropdown menu triggered by a button, featuring full Popper floating positioning, WAI-ARIA 1.2 roving keyboard navigation, typeahead searching, checkbox toggles, radio groups, and submenus.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "dropdown-menu-showcase" }, [
        // Section 1: All-in-One Component (Tier 1)
        $div({ className: "dropdown-menu-section" }, [
          $h3({ className: "dropdown-menu-section-title" }, "1. All-in-One Component (Tier 1)"),
          $p({ className: "card-desc" }, "Declarative dropdown menu with icons, shortcuts, and separators:"),
          $div({ className: "dropdown-menu-row" }, [
            DropdownMenu({
              id: "all-in-one-dropdown",
              trigger: "Actions ▾",
              items: [
                {
                  value: "edit",
                  label: "Edit Project",
                  icon: "✏️",
                  onSelect: () => lastAction("Edit Project"),
                },
                {
                  value: "duplicate",
                  label: "Duplicate",
                  icon: "📋",
                  onSelect: () => lastAction("Duplicate"),
                },
                { type: "separator" },
                {
                  value: "archive",
                  label: "Archive",
                  icon: "📦",
                  onSelect: () => lastAction("Archive"),
                },
                {
                  value: "export",
                  label: "Export Zip",
                  icon: "📤",
                  onSelect: () => lastAction("Export Zip"),
                },
                { type: "separator" },
                {
                  value: "delete",
                  label: "Delete Project",
                  icon: "🗑️",
                  disabled: true,
                  onSelect: () => lastAction("Delete Project"),
                },
              ],
            }),
            $div({ className: "dropdown-menu-status-badge" }, [
              "Last Action: ",
              $span({ style: "color: hsl(217, 91%, 60%); font-weight: 600;" }, lastAction),
            ]),
          ]),
        ]),

        // Section 2: Fine-Grained Coordinator (Tier 2) with Checkbox & Radio
        $div({ className: "dropdown-menu-section" }, [
          $h3({ className: "dropdown-menu-section-title" }, "2. Fine-Grained Coordinator (Tier 2) with Checkbox & Radio"),
          $p({ className: "card-desc" }, "Custom DOM sculpting with CheckboxItem and RadioGroup helpers:"),
          $div({ className: "dropdown-menu-row" }, [
            customDropdown.Root({}, [
              customDropdown.Trigger({}, "View Options ⚙️ ▾"),
              customDropdown.Content({}, [
                customDropdown.GroupLabel({}, "Preferences"),
                customDropdown.CheckboxItem(
                  {
                    value: "notifications",
                    checked: notifications,
                    onChange: (val) => notifications(val),
                  },
                  [
                    customDropdown.ItemIndicator({}, notifications.as((checked) => (checked ? "✓" : ""))),
                    customDropdown.ItemLabel({}, "Enable notifications"),
                  ],
                ),
                customDropdown.Separator(),
                customDropdown.GroupLabel({}, "Sort By"),
                sortRadio.Root({}, [
                  sortRadio.Item({ value: "date" }, [
                    customDropdown.ItemIndicator({}, sortOrder.as((s) => (s === "date" ? "●" : "○"))),
                    customDropdown.ItemLabel({}, "Date Added"),
                  ]),
                  sortRadio.Item({ value: "name" }, [
                    customDropdown.ItemIndicator({}, sortOrder.as((s) => (s === "name" ? "●" : "○"))),
                    customDropdown.ItemLabel({}, "Alphabetical"),
                  ]),
                  sortRadio.Item({ value: "size" }, [
                    customDropdown.ItemIndicator({}, sortOrder.as((s) => (s === "size" ? "●" : "○"))),
                    customDropdown.ItemLabel({}, "File Size"),
                  ]),
                ]),
              ]),
            ]),
            $div({ className: "dropdown-menu-status-badge" }, [
              "Notifications: ",
              $span(
                { style: "color: hsl(217, 91%, 60%); font-weight: 600;" },
                notifications.as((v) => (v ? "Enabled" : "Disabled")),
              ),
              " | Sort: ",
              $span({ style: "color: hsl(217, 91%, 60%); font-weight: 600;" }, sortOrder),
            ]),
          ]),
        ]),

        // Section 3: Nested Submenus
        $div({ className: "dropdown-menu-section" }, [
          $h3({ className: "dropdown-menu-section-title" }, "3. Submenus (createSub Coordinator)"),
          $p({ className: "card-desc" }, "Hierarchical nested menus with ArrowRight / ArrowLeft navigation:"),
          $div({ className: "dropdown-menu-row" }, [
            parentDropdown.Root({}, [
              parentDropdown.Trigger({}, "File ▾"),
              parentDropdown.Content({}, [
                parentDropdown.Item({ value: "new-file", onSelect: () => lastAction("New File") }, [
                  parentDropdown.Icon({}, "📄"),
                  parentDropdown.ItemLabel({}, "New File"),
                ]),
                parentDropdown.Item({ value: "open", onSelect: () => lastAction("Open") }, [
                  parentDropdown.Icon({}, "📂"),
                  parentDropdown.ItemLabel({}, "Open Project"),
                ]),
                parentDropdown.Separator(),
                parentDropdown.Sub({ subInstance: exportSub }, [
                  parentDropdown.SubTrigger({ subInstance: exportSub, value: "export" }, [
                    parentDropdown.Icon({}, "📤"),
                    parentDropdown.ItemLabel({}, "Export As"),
                  ]),
                  parentDropdown.SubContent({ subInstance: exportSub }, [
                    exportSub.Item({ value: "pdf", onSelect: () => lastAction("Export PDF") }, [
                      exportSub.Icon({}, "📕"),
                      exportSub.ItemLabel({}, "PDF Document"),
                    ]),
                    exportSub.Item({ value: "csv", onSelect: () => lastAction("Export CSV") }, [
                      exportSub.Icon({}, "📊"),
                      exportSub.ItemLabel({}, "CSV Spreadsheet"),
                    ]),
                    exportSub.Item({ value: "json", onSelect: () => lastAction("Export JSON") }, [
                      exportSub.Icon({}, "📦"),
                      exportSub.ItemLabel({}, "JSON Data"),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),

        // Section 4: Dynamic Reactive Item List (Runtime Updates)
        $div({ className: "dropdown-menu-section" }, [
          $h3({ className: "dropdown-menu-section-title" }, "4. Dynamic Reactive Item List (Runtime Updates)"),
          $p(
            { className: "card-desc" },
            "Options bound to a reactive observable list using dropdown.List. Items update fine-grained without remounting.",
          ),
          $div({ className: "controls-row", style: "display: flex; gap: 0.5rem; margin-bottom: 0.75rem;" }, [
            $button({ className: "control-btn", onclick: addAction }, "+ Add Action"),
            $button({ className: "control-btn", onclick: removeAction }, "- Remove Action"),
          ]),
          $div({ className: "dropdown-menu-row" }, [
            DropdownMenu({
              id: "dynamic-dropdown-demo",
              trigger: "Dynamic Actions ▾",
              items: dynamicItems,
            }),
            $div({ className: "dropdown-menu-status-badge" }, [
              "Total Actions Available: ",
              $span(
                { style: "color: hsl(217, 91%, 60%); font-weight: 600;" },
                dynamicItems.as((items) => String(items.length)),
              ),
            ]),
          ]),
        ]),
      ]),
    ]),

    // Code Examples
    $div({ className: "card-section" }, [
      $h3({ className: "card-section-title" }, "Usage Examples"),
      CodeBlock({
        language: "typescript",
        code: `import { DropdownMenu, createDropdownMenu } from "@fimbul-works/seidr-ui";

// Tier 1: All-in-One Component
DropdownMenu({
  trigger: "Actions ▾",
  items: [
    { value: "edit", label: "Edit", icon: "✏️", onSelect: () => console.log("Edit") },
    { value: "duplicate", label: "Duplicate", icon: "📋" },
    { type: "separator" },
    { value: "delete", label: "Delete", icon: "🗑️", disabled: true },
  ],
});

// Tier 2: Fine-Grained Coordinator
const dropdown = createDropdownMenu();
const sortRadio = dropdown.createRadioGroup({ value: sortOrder, onChange: (v) => sortOrder(v) });

dropdown.Root({}, [
  dropdown.Trigger({}, "Options ▾"),
  dropdown.Content({}, [
    dropdown.Item({ value: "save" }, [
      dropdown.Icon({}, "💾"),
      dropdown.ItemLabel({}, "Save"),
    ]),
    dropdown.CheckboxItem({ value: "notifications", checked: isNotifications }, [
      dropdown.ItemIndicator({}, "✓"),
      dropdown.ItemLabel({}, "Notifications"),
    ]),
    sortRadio.Root({}, [
      sortRadio.Item({ value: "date" }, "Date"),
      sortRadio.Item({ value: "name" }, "Name"),
    ]),
  ]),
]);`,
      }),
    ]),
  ]);
});

