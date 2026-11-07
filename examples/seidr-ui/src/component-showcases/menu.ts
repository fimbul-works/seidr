import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createMenu, Menu, type MenuItemDescriptor } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./menu.css";

export const MenuShowcase = createComponent(() => {
  // Reactive feedback state
  const lastAction = createValue<string>("None");
  const autosave = createValue<boolean>(true);
  const theme = createValue<string>("system");

  // Dynamic items state for Section 4
  const dynamicItems = createValue<MenuItemDescriptor[]>([
    { value: "action-1", label: "Quick Action 1", icon: "⚡" },
    { value: "action-2", label: "Quick Action 2", icon: "⭐" },
    { value: "action-3", label: "Quick Action 3", icon: "🚀" },
  ]);
  let nextActionId = 4;

  const addAction = () => {
    const id = nextActionId++;
    dynamicItems((prev) => [
      ...prev,
      { value: `action-` + id, label: `Quick Action ` + id, icon: "✨" },
    ]);
  };

  const removeAction = () => {
    dynamicItems((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Tier 2 Coordinator for Section 2
  const customMenu = createMenu({ id: "fine-grained-menu" });
  const themeRadio = customMenu.createRadioGroup({
    value: theme,
    onChange: (val) => theme(val),
  });

  // Submenu coordinator for Section 3
  const parentMenu = createMenu({ id: "parent-menu-demo" });
  const shareSub = parentMenu.createSub({ id: "share-sub" });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Menu"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "Displays a versatile dropdown menu with full Popper floating positioning, WAI-ARIA 1.2 roving keyboard navigation, typeahead searching, checkbox items, radio groups, submenus, and fine-grained reactive lists.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "menu-showcase" }, [
        // Section 1: All-in-One Component (Tier 1)
        $div({ className: "menu-section" }, [
          $h3({ className: "menu-section-title" }, "1. All-in-One Component (Tier 1)"),
          $p({ className: "card-desc" }, "Declarative dropdown menu with icons, shortcuts, and separators:"),
          $div({ className: "menu-row" }, [
            Menu({
              id: "tier1-menu",
              trigger: "Document Actions ▾",
              items: [
                {
                  value: "new",
                  label: "New Document",
                  icon: "📄",
                  description: "Ctrl+N",
                  onSelect: () => lastAction("New Document"),
                },
                {
                  value: "open",
                  label: "Open...",
                  icon: "📂",
                  description: "Ctrl+O",
                  onSelect: () => lastAction("Open Document"),
                },
                { type: "separator" },
                {
                  value: "save",
                  label: "Save",
                  icon: "💾",
                  description: "Ctrl+S",
                  onSelect: () => lastAction("Save Document"),
                },
                {
                  value: "export",
                  label: "Export PDF",
                  icon: "📤",
                  onSelect: () => lastAction("Export PDF"),
                },
                { type: "separator" },
                {
                  value: "delete",
                  label: "Delete",
                  icon: "🗑️",
                  disabled: true,
                  onSelect: () => lastAction("Delete Document"),
                },
              ],
            }),
            $div({ className: "menu-status-badge" }, [
              "Last Action: ",
              $span({ style: "color: var(--primary, #3b82f6); font-weight: 600;" }, lastAction),
            ]),
          ]),
        ]),

        // Section 2: Fine-Grained Coordinator (Tier 2) with Checkbox & Radio
        $div({ className: "menu-section" }, [
          $h3({ className: "menu-section-title" }, "2. Fine-Grained Coordinator (Tier 2) with Checkbox & Radio"),
          $p({ className: "card-desc" }, "Custom DOM sculpting with CheckboxItem and RadioGroup helpers:"),
          $div({ className: "menu-row" }, [
            customMenu.Root({}, [
              customMenu.Trigger({}, "Settings ⚙️ ▾"),
              customMenu.Content({}, [
                customMenu.GroupLabel({}, "Preferences"),
                customMenu.CheckboxItem(
                  {
                    value: "autosave",
                    checked: autosave,
                    onChange: (val) => autosave(val),
                  },
                  [
                    customMenu.ItemIndicator({}, autosave.as((checked) => (checked ? "✓" : ""))),
                    customMenu.ItemLabel({}, "Autosave changes"),
                  ],
                ),
                customMenu.Separator(),
                customMenu.GroupLabel({}, "Theme Mode"),
                themeRadio.Root({}, [
                  themeRadio.Item({ value: "light" }, [
                    customMenu.ItemIndicator({}, theme.as((t) => (t === "light" ? "●" : "○"))),
                    customMenu.ItemLabel({}, "Light Theme"),
                  ]),
                  themeRadio.Item({ value: "dark" }, [
                    customMenu.ItemIndicator({}, theme.as((t) => (t === "dark" ? "●" : "○"))),
                    customMenu.ItemLabel({}, "Dark Theme"),
                  ]),
                  themeRadio.Item({ value: "system" }, [
                    customMenu.ItemIndicator({}, theme.as((t) => (t === "system" ? "●" : "○"))),
                    customMenu.ItemLabel({}, "System Default"),
                  ]),
                ]),
              ]),
            ]),
            $div({ className: "menu-status-badge" }, [
              "Autosave: ",
              $span(
                { style: "color: var(--primary, #3b82f6); font-weight: 600;" },
                autosave.as((v) => (v ? "Enabled" : "Disabled")),
              ),
              " | Theme: ",
              $span({ style: "color: var(--primary, #3b82f6); font-weight: 600;" }, theme),
            ]),
          ]),
        ]),

        // Section 3: Nested Submenus
        $div({ className: "menu-section" }, [
          $h3({ className: "menu-section-title" }, "3. Multi-Level Submenus"),
          $p({ className: "card-desc" }, "Cascading nested submenus with keyboard navigation (ArrowRight / ArrowLeft):"),
          $div({ className: "menu-row" }, [
            parentMenu.Root({}, [
              parentMenu.Trigger({}, "File Options ▾"),
              parentMenu.Content({}, [
                parentMenu.Item({ value: "cut", onSelect: () => lastAction("Cut") }, [
                  parentMenu.Icon({}, "✂️"),
                  parentMenu.ItemLabel({}, "Cut"),
                ]),
                parentMenu.Item({ value: "copy", onSelect: () => lastAction("Copy") }, [
                  parentMenu.Icon({}, "📋"),
                  parentMenu.ItemLabel({}, "Copy"),
                ]),
                parentMenu.Separator(),
                parentMenu.Sub({ subInstance: shareSub }, [
                  parentMenu.SubTrigger({ subInstance: shareSub, value: "share" }, [
                    parentMenu.Icon({}, "🔗"),
                    parentMenu.ItemLabel({}, "Share File"),
                  ]),
                  parentMenu.SubContent({ subInstance: shareSub }, [
                    shareSub.Item({ value: "email", onSelect: () => lastAction("Share via Email") }, [
                      shareSub.Icon({}, "✉️"),
                      shareSub.ItemLabel({}, "Email Link"),
                    ]),
                    shareSub.Item({ value: "slack", onSelect: () => lastAction("Share via Slack") }, [
                      shareSub.Icon({}, "💬"),
                      shareSub.ItemLabel({}, "Slack Message"),
                    ]),
                    shareSub.Item({ value: "teams", onSelect: () => lastAction("Share via Teams") }, [
                      shareSub.Icon({}, "👥"),
                      shareSub.ItemLabel({}, "Microsoft Teams"),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),

        // Section 4: Dynamic Reactive Item List (menu.List)
        $div({ className: "menu-section" }, [
          $h3({ className: "menu-section-title" }, "4. Dynamic Reactive Item List (Runtime Updates)"),
          $p(
            { className: "card-desc" },
            "Options bound to a reactive observable list using menu.List. Items update fine-grained without remounting the menu.",
          ),
          $div({ className: "controls-row", style: "display: flex; gap: 0.5rem; margin-bottom: 0.75rem;" }, [
            $button({ className: "control-btn", onclick: addAction }, "+ Add Action"),
            $button({ className: "control-btn", onclick: removeAction }, "- Remove Action"),
          ]),
          $div({ className: "menu-row" }, [
            Menu({
              id: "dynamic-menu-demo",
              trigger: "Dynamic Actions ▾",
              items: dynamicItems,
            }),
            $div({ className: "menu-status-badge" }, [
              "Total Actions Available: ",
              $span(
                { style: "color: var(--primary, #3b82f6); font-weight: 600;" },
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
        code: `import { Menu, createMenu } from "@fimbul-works/seidr-ui";

// Tier 1: All-in-One Component
const FileMenu = () =>
  Menu({
    trigger: "Actions ▾",
    items: [
      { value: "edit", label: "Edit", icon: "✏️", onSelect: () => console.log("Edit") },
      { value: "duplicate", label: "Duplicate", icon: "📋" },
      { type: "separator" },
      { value: "delete", label: "Delete", icon: "🗑️", disabled: true },
    ],
  });

// Tier 2: Fine-Grained Coordinator
const menu = createMenu();
const themeRadio = menu.createRadioGroup({ value: theme, onChange: (v) => theme(v) });

const App = () =>
  menu.Root({}, [
    menu.Trigger({}, "Options ▾"),
    menu.Content({}, [
      menu.Item({ value: "save" }, [
        menu.Icon({}, "💾"),
        menu.ItemLabel({}, "Save"),
      ]),
      menu.CheckboxItem({ value: "autosave", checked: isAutosave }, [
        menu.ItemIndicator({}, "✓"),
        menu.ItemLabel({}, "Autosave"),
      ]),
      themeRadio.Root({}, [
        themeRadio.Item({ value: "light" }, "Light"),
        themeRadio.Item({ value: "dark" }, "Dark"),
      ]),
    ]),
  ]);`,
      }),
    ]),
  ]);
});

