import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import {
  ContextMenu,
  type ContextMenuItemDescriptor,
  createContextMenu,
} from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./context-menu.css";

export const ContextMenuShowcase = createComponent(() => {
  const lastAction = createValue<string>("None");
  const showBookmarks = createValue<boolean>(true);
  const zoomLevel = createValue<string>("100");

  // Dynamic actions
  const actionCounter = createValue<number>(3);
  const dynamicItems = createValue<ContextMenuItemDescriptor[]>([
    {
      value: "action-1",
      label: "Custom Action 1",
      onSelect: () => lastAction("Custom Action 1"),
    },
    {
      value: "action-2",
      label: "Custom Action 2",
      onSelect: () => lastAction("Custom Action 2"),
    },
  ]);

  const addAction = () => {
    const nextId = actionCounter() + 1;
    actionCounter(nextId);
    dynamicItems((prev) => [
      ...prev,
      {
        value: `action-${nextId}`,
        label: `Custom Action ${nextId}`,
        onSelect: () => lastAction(`Custom Action ${nextId}`),
      },
    ]);
  };

  const removeAction = () => {
    dynamicItems((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Tier 2 Custom Context Menu Coordinator
  const customCm = createContextMenu({ id: "fine-grained-cm" });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "ContextMenu"),
      $span({ className: "card-badge" }, "Floating Primitives"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible right-click and touch long-press context menu positioned at the pointer coordinates via virtual Popper anchor bounds. Built on Seidr's two-tier architecture with full WAI-ARIA roles, submenus, checkboxes, radio groups, and roving focus navigation.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "context-menu-showcase" }, [
        // Status bar
        $div(
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              backgroundColor: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "0.85rem",
              flexWrap: "wrap",
            },
          },
          [
            $div([
              $span({ style: { opacity: "0.6" } }, "Last Triggered: "),
              $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 70%)" } }, [
                lastAction,
              ]),
            ]),
            $div([
              $span({ style: { opacity: "0.6" } }, "Bookmarks Bar: "),
              $span({ style: { fontWeight: "600", color: "hsl(142, 71%, 65%)" } }, [
                showBookmarks.as((v) => (v ? "Shown" : "Hidden")),
              ]),
            ]),
            $div([
              $span({ style: { opacity: "0.6" } }, "Zoom Level: "),
              $span({ style: { fontWeight: "600", color: "hsl(45, 93%, 67%)" } }, [
                zoomLevel.as((v) => `${v}%`),
              ]),
            ]),
          ],
        ),

        // Section 1: All-in-One ContextMenu (Tier 1)
        $div({ className: "context-menu-section" }, [
          $h3({ className: "context-menu-section-title" }, "1. Tier 1: All-in-One ContextMenu"),
          $p(
            { style: { fontSize: "0.85rem", opacity: "0.75", margin: "0 0 0.5rem 0" } },
            "Right-click anywhere inside the area below (or long-press on touch devices) to open the context menu.",
          ),
          $div({ className: "context-menu-grid" }, [
            ContextMenu({
              id: "all-in-one-cm",
              trigger: [
                $span({ style: { fontSize: "1.75rem" } }, "🖱️"),
                $span({ style: { fontWeight: "600" } }, "Standard Context Menu"),
                $span({ className: "context-menu-target-hint" }, "Right-click or touch long-press here"),
              ],
              items: [
                {
                  value: "reload",
                  label: "Reload",
                  icon: "🔄",
                  children: [$span({ className: "context-menu-shortcut" }, "Ctrl+R")],
                  onSelect: () => lastAction("Reload"),
                },
                {
                  value: "back",
                  label: "Back",
                  icon: "◀",
                  children: [$span({ className: "context-menu-shortcut" }, "Alt+←")],
                  onSelect: () => lastAction("Back"),
                },
                {
                  value: "forward",
                  label: "Forward",
                  icon: "▶",
                  disabled: true,
                  onSelect: () => lastAction("Forward"),
                },
                { type: "separator" },
                {
                  type: "checkbox",
                  value: "bookmarks",
                  label: "Show Bookmarks Bar",
                  checked: showBookmarks,
                  onChange: (checked) => {
                    showBookmarks(checked);
                    lastAction(checked ? "Bookmarks Shown" : "Bookmarks Hidden");
                  },
                },
                { type: "separator" },
                {
                  type: "radio-group",
                  value: zoomLevel,
                  onChange: (val) => {
                    zoomLevel(val);
                    lastAction(`Zoom ${val}%`);
                  },
                  items: [
                    { value: "100", label: "Zoom 100%" },
                    { value: "125", label: "Zoom 125%" },
                    { value: "150", label: "Zoom 150%" },
                  ],
                },
                { type: "separator" },
                {
                  type: "submenu",
                  value: "share",
                  label: "Share As... ▶",
                  icon: "🔗",
                  items: [
                    {
                      value: "share-email",
                      label: "Email Link",
                      icon: "✉️",
                      onSelect: () => lastAction("Shared via Email"),
                    },
                    {
                      value: "share-copy",
                      label: "Copy Clean URL",
                      icon: "📋",
                      onSelect: () => lastAction("Copied Clean URL"),
                    },
                  ],
                },
              ],
            }),

            ContextMenu({
              id: "disabled-demo-cm",
              disabled: true,
              trigger: [
                $span({ style: { fontSize: "1.75rem", opacity: "0.5" } }, "🚫"),
                $span({ style: { fontWeight: "600" } }, "Disabled Context Menu"),
                $span({ className: "context-menu-target-hint" }, "Right-click triggers default browser context menu"),
              ],
            }),
          ]),
        ]),

        // Section 2: Fine-Grained Composition (Tier 2)
        $div({ className: "context-menu-section" }, [
          $h3({ className: "context-menu-section-title" }, "2. Tier 2: Fine-Grained Composition (createContextMenu)"),
          $p(
            { style: { fontSize: "0.85rem", opacity: "0.75", margin: "0 0 0.5rem 0" } },
            "Fine-grained control over subcomponents (Root, Trigger, Content, Item, Icon, Separator) with custom element tags.",
          ),
          customCm.Root({}, [
            customCm.Trigger(
              {
                style: {
                  background: "linear-gradient(135deg, hsla(260, 40%, 20%, 0.5), hsla(220, 40%, 15%, 0.5))",
                  borderColor: "hsla(260, 50%, 40%, 0.4)",
                },
              },
              [
                $span({ style: { fontSize: "1.75rem" } }, "🎨"),
                $span({ style: { fontWeight: "600" } }, "Canvas / Custom Target Area"),
                $span({ className: "context-menu-target-hint" }, "Right-click to inspect canvas actions"),
              ],
            ),
            customCm.Content({}, [
              customCm.Item({ value: "export-png", onSelect: () => lastAction("Export as PNG") }, [
                customCm.Icon({}, "🖼️"),
                customCm.ItemLabel({}, "Export as PNG"),
              ]),
              customCm.Item({ value: "export-svg", onSelect: () => lastAction("Export as SVG") }, [
                customCm.Icon({}, "📐"),
                customCm.ItemLabel({}, "Export as SVG"),
              ]),
              customCm.Separator(),
              customCm.Item({ value: "view-source", onSelect: () => lastAction("View Page Source") }, [
                customCm.Icon({}, "🔍"),
                customCm.ItemLabel({}, "View Page Source"),
              ]),
              customCm.Item({ value: "inspect", onSelect: () => lastAction("Inspect Element") }, [
                customCm.Icon({}, "🛠️"),
                customCm.ItemLabel({}, "Inspect Element"),
              ]),
            ]),
          ]),
        ]),

        // Section 3: Dynamic Reactive Actions
        $div({ className: "context-menu-section" }, [
          $h3({ className: "context-menu-section-title" }, "3. Reactive Dynamic Actions List"),
          $p(
            { style: { fontSize: "0.85rem", opacity: "0.75", margin: "0 0 0.5rem 0" } },
            "Demonstrates dynamic reactive collections inside a context menu using Seidr's fine-grained reactive items.",
          ),
          $div(
            { style: { display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem" } },
            [
              $button(
                {
                  className: "btn",
                  style: { padding: "0.4rem 0.8rem", fontSize: "0.825rem" },
                  onclick: addAction,
                },
                "➕ Add Dynamic Action",
              ),
              $button(
                {
                  className: "btn btn-secondary",
                  style: { padding: "0.4rem 0.8rem", fontSize: "0.825rem" },
                  onclick: removeAction,
                },
                "➖ Remove Action",
              ),
              $span({ style: { fontSize: "0.825rem", opacity: "0.7" } }, [
                "Total Actions: ",
                dynamicItems.as((arr) => arr.length),
              ]),
            ],
          ),
          ContextMenu({
            id: "dynamic-cm",
            trigger: [
              $span({ style: { fontSize: "1.75rem" } }, "⚡"),
              $span({ style: { fontWeight: "600" } }, "Dynamic Actions Target Area"),
              $span({ className: "context-menu-target-hint" }, "Right-click to view the dynamically updated action list"),
            ],
            items: dynamicItems,
          }),
        ]),
      ]),
    ]),

    // Usage Examples
    CodeBlock({
      language: "typescript",
      code: `import { ContextMenu, createContextMenu } from "@fimbul-works/seidr-ui";

// 1. Tier 1: All-in-One ContextMenu
const MyContextMenu = ContextMenu({
  trigger: "Right click here",
  items: [
    { value: "reload", label: "Reload", icon: "🔄", onSelect: () => console.log("Reload") },
    { value: "back", label: "Back", icon: "◀" },
    { type: "separator" },
    {
      type: "checkbox",
      value: "bookmarks",
      label: "Show Bookmarks",
      checked: showBookmarks,
      onChange: (v) => showBookmarks(v),
    },
    {
      type: "submenu",
      label: "Share As... ▶",
      items: [
        { value: "email", label: "Email" },
        { value: "copy", label: "Copy Link" },
      ],
    },
  ],
});

// 2. Tier 2: Fine-Grained Composition
const cm = createContextMenu();
const FineGrained = cm.Root({}, [
  cm.Trigger({}, "Custom Area"),
  cm.Content({}, [
    cm.Item({ value: "inspect", onSelect: () => console.log("Inspect") }, [
      cm.Icon({}, "🛠️"),
      cm.ItemLabel({}, "Inspect Element"),
    ]),
  ]),
]);`,
    }),
  ]);
});

