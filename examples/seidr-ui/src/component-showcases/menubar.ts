import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createMenubar, Menubar } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./menubar.css";

export const MenubarShowcase = createComponent(() => {
  const lastAction = createValue<string>("None");
  const showBookmarks = createValue<boolean>(true);
  const fullScreen = createValue<boolean>(false);
  const zoomLevel = createValue<string>("100");

  // Tier 2 Custom Menubar Coordinator
  const customMb = createMenubar({ id: "fine-grained-mb" });
  const customFile = customMb.createMenu("custom-file");
  const customEdit = customMb.createMenu("custom-edit");

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Menubar"),
      $span({ className: "card-badge" }, "Floating Primitives"),
    ]),
    $p(
      { className: "card-desc" },
      "A persistent horizontal desktop application menu bar coordinating multiple top-level dropdown menus. Features roving tabindex focus (ArrowRight / ArrowLeft), automatic hover intent switching across sibling menus when open, arrow navigation into items (ArrowDown / ArrowUp), submenus, checkboxes, and radio groups.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "menubar-showcase" }, [
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
              $span({ style: { opacity: "0.6" } }, "Bookmarks: "),
              $span({ style: { fontWeight: "600", color: "hsl(142, 71%, 65%)" } }, [
                showBookmarks.as((v) => (v ? "Visible" : "Hidden")),
              ]),
            ]),
            $div([
              $span({ style: { opacity: "0.6" } }, "Full Screen: "),
              $span({ style: { fontWeight: "600", color: "hsl(280, 85%, 70%)" } }, [
                fullScreen.as((v) => (v ? "Enabled" : "Disabled")),
              ]),
            ]),
            $div([
              $span({ style: { opacity: "0.6" } }, "Zoom: "),
              $span({ style: { fontWeight: "600", color: "hsl(45, 93%, 67%)" } }, [
                zoomLevel.as((v) => `${v}%`),
              ]),
            ]),
          ],
        ),

        // Section 1: All-in-One Menubar (Tier 1)
        $div({ className: "menubar-section" }, [
          $h3({ className: "menubar-section-title" }, "1. Tier 1: All-in-One Menubar"),
          $p(
            { style: { fontSize: "0.85rem", opacity: "0.75", margin: "0 0 0.5rem 0" } },
            "Click any menu or navigate horizontally using ArrowRight / ArrowLeft. Once a menu is open, hovering over any sibling menu switches to it instantly.",
          ),
          Menubar({
            id: "all-in-one-demo-mb",
            menus: [
              {
                value: "file",
                trigger: "File",
                items: [
                  {
                    value: "new-window",
                    label: "New Window",
                    icon: "🪟",
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+N")],
                    onSelect: () => lastAction("New Window"),
                  },
                  {
                    value: "open-file",
                    label: "Open File...",
                    icon: "📂",
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+O")],
                    onSelect: () => lastAction("Open File..."),
                  },
                  {
                    type: "sub",
                    value: "recent",
                    label: "Open Recent ▶",
                    items: [
                      {
                        value: "rec-1",
                        label: "workspace-alpha.ts",
                        onSelect: () => lastAction("Opened workspace-alpha.ts"),
                      },
                      {
                        value: "rec-2",
                        label: "config.json",
                        onSelect: () => lastAction("Opened config.json"),
                      },
                    ],
                  },
                  { type: "separator" },
                  {
                    type: "sub",
                    value: "share",
                    label: "Share ▶",
                    icon: "🔗",
                    items: [
                      {
                        value: "share-email",
                        label: "Email Workspace",
                        icon: "✉️",
                        onSelect: () => lastAction("Shared via Email"),
                      },
                      {
                        value: "share-clipboard",
                        label: "Copy Link",
                        icon: "📋",
                        onSelect: () => lastAction("Copied Link"),
                      },
                    ],
                  },
                  { type: "separator" },
                  {
                    value: "exit",
                    label: "Exit Application",
                    icon: "🚪",
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+Q")],
                    onSelect: () => lastAction("Exit Application"),
                  },
                ],
              },
              {
                value: "edit",
                trigger: "Edit",
                items: [
                  {
                    value: "undo",
                    label: "Undo",
                    icon: "↩️",
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+Z")],
                    onSelect: () => lastAction("Undo"),
                  },
                  {
                    value: "redo",
                    label: "Redo",
                    icon: "↪️",
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+Y")],
                    onSelect: () => lastAction("Redo"),
                  },
                  { type: "separator" },
                  {
                    value: "cut",
                    label: "Cut",
                    icon: "✂️",
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+X")],
                    onSelect: () => lastAction("Cut"),
                  },
                  {
                    value: "copy",
                    label: "Copy",
                    icon: "📄",
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+C")],
                    onSelect: () => lastAction("Copy"),
                  },
                  {
                    value: "paste",
                    label: "Paste",
                    icon: "📋",
                    disabled: true,
                    children: [$span({ className: "menubar-shortcut" }, "Ctrl+V")],
                    onSelect: () => lastAction("Paste"),
                  },
                ],
              },
              {
                value: "view",
                trigger: "View",
                items: [
                  {
                    type: "checkbox",
                    value: "bookmarks",
                    label: "Show Bookmarks",
                    indicator: "✓",
                    checked: showBookmarks,
                    onChange: (c) => {
                      showBookmarks(c);
                      lastAction(c ? "Bookmarks Enabled" : "Bookmarks Hidden");
                    },
                  },
                  {
                    type: "checkbox",
                    value: "fullscreen",
                    label: "Full Screen Mode",
                    indicator: "✓",
                    checked: fullScreen,
                    onChange: (c) => {
                      fullScreen(c);
                      lastAction(c ? "Entered Full Screen" : "Exited Full Screen");
                    },
                  },
                  { type: "separator" },
                  {
                    type: "radio-group",
                    value: zoomLevel,
                    onChange: (val) => {
                      zoomLevel(val);
                      lastAction(`Zoom set to ${val}%`);
                    },
                    items: [
                      { value: "100", label: "100% Zoom", indicator: "•" },
                      { value: "125", label: "125% Zoom", indicator: "•" },
                      { value: "150", label: "150% Zoom", indicator: "•" },
                    ],
                  },
                ],
              },
              {
                value: "help",
                trigger: "Help",
                items: [
                  {
                    value: "docs",
                    label: "Documentation",
                    icon: "📖",
                    onSelect: () => lastAction("Documentation Opened"),
                  },
                  {
                    value: "updates",
                    label: "Check for Updates...",
                    icon: "🔄",
                    onSelect: () => lastAction("Checked Updates"),
                  },
                  { type: "separator" },
                  {
                    value: "about",
                    label: "About Seidr UI",
                    icon: "ℹ️",
                    onSelect: () => lastAction("About Seidr UI"),
                  },
                ],
              },
            ],
          }),
        ]),

        // Section 2: Fine-Grained Composition (Tier 2)
        $div({ className: "menubar-section" }, [
          $h3({ className: "menubar-section-title" }, "2. Tier 2: Fine-Grained Coordinator (`createMenubar`)"),
          $p(
            { style: { fontSize: "0.85rem", opacity: "0.75", margin: "0 0 0.5rem 0" } },
            "Fine-grained control where each top-level menu and subcomponent is customized and sculpted explicitly.",
          ),
          customMb.Root({}, [
            customMb.Menu({ value: "custom-file" }, [
              customFile.Trigger({}, [
                $span({ style: { marginRight: "0.35rem" } }, "📁"),
                "Project",
              ]),
              customFile.Content({}, [
                customFile.Item(
                  { onSelect: () => lastAction("New Project Created") },
                  [customFile.Icon({}, "✨"), "New Project"],
                ),
                customFile.Item(
                  { onSelect: () => lastAction("Project Saved") },
                  [customFile.Icon({}, "💾"), "Save Project"],
                ),
                customFile.Separator(),
                customFile.Item(
                  { onSelect: () => lastAction("Project Closed") },
                  [customFile.Icon({}, "✖️"), "Close Project"],
                ),
              ]),
            ]),
            customMb.Menu({ value: "custom-edit" }, [
              customEdit.Trigger({}, [
                $span({ style: { marginRight: "0.35rem" } }, "⚡"),
                "Actions",
              ]),
              customEdit.Content({}, [
                customEdit.Item(
                  { onSelect: () => lastAction("Quick Build Executed") },
                  [customEdit.Icon({}, "🚀"), "Run Build"],
                ),
                customEdit.Item(
                  { onSelect: () => lastAction("Tests Executed") },
                  [customEdit.Icon({}, "🧪"), "Run Tests"],
                ),
                customEdit.Item(
                  { onSelect: () => lastAction("Deployment Triggered") },
                  [customEdit.Icon({}, "☁️"), "Deploy to Cloud"],
                ),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),

    // Code snippets
    CodeBlock({
      code: `import { Menubar, createMenubar } from "@fimbul-works/seidr-ui";
import "./menubar.css";

// 1. Tier 1: All-in-One Component
Menubar({
  menus: [
    {
      value: "file",
      trigger: "File",
      items: [
        { value: "new", label: "New Window", children: [$span("Ctrl+N")] },
        { value: "open", label: "Open File...", children: [$span("Ctrl+O")] },
        {
          type: "sub",
          value: "recent",
          label: "Recent Files ▶",
          items: [{ value: "f1", label: "app.ts" }],
        },
      ],
    },
    {
      value: "view",
      trigger: "View",
      items: [
        { type: "checkbox", value: "bookmarks", label: "Show Bookmarks", checked: isBookmarksOpen },
        {
          type: "radio-group",
          value: zoomLevel,
          items: [{ value: "100", label: "100%" }, { value: "125", label: "125%" }],
        },
      ],
    },
  ],
});

// 2. Tier 2: Fine-Grained Coordinator
const mb = createMenubar();
const file = mb.createMenu("file");

mb.Root({}, [
  mb.Menu({ value: "file" }, [
    file.Trigger({}, "File"),
    file.Content({}, [
      file.Item({ onSelect: () => console.log("New") }, "New Window"),
    ]),
  ]),
]);`,
      language: "typescript",
    }),
  ]);
});

