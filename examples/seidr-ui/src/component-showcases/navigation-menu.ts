import { createComponent, createValue, List, type ReactiveValue, Show } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $img, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createNavigationMenu, type MenubarOrientation, RadioGroup } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./navigation-menu.css";

interface DynamicAction {
  id: string;
  title: string;
  description: string;
  badge: string;
}

export const NavigationMenuShowcase = createComponent(() => {
  const lastAction = createValue<string>("None");
  const orientation = createValue<MenubarOrientation>("horizontal");

  const initialActions: DynamicAction[] = [
    {
      id: "action-1",
      title: "Deploy to Production",
      description: "Trigger automated CI/CD pipeline",
      badge: "CI/CD",
    },
    {
      id: "action-2",
      title: "Run Smoke Tests",
      description: "Execute end-to-end browser suite",
      badge: "Testing",
    },
  ];

  const dynamicActions = createValue<DynamicAction[]>(initialActions);
  let actionCounter = 3;

  const addAction = () => {
    const newId = `action-${actionCounter++}`;
    dynamicActions((prev) => [
      ...prev,
      {
        id: newId,
        title: `Custom Action #${actionCounter - 1}`,
        description: `Dynamically registered task in reactive sub-menu`,
        badge: "Dynamic",
      },
    ]);
    lastAction(`Added Action #${actionCounter - 1}`);
  };

  const clearActions = () => {
    dynamicActions([]);
    lastAction("Cleared Dynamic Actions");
  };

  // Fine-Grained Navigation Menu Coordinator
  const nav = createNavigationMenu({
    orientation,
    delayDuration: 150,
    skipDelayDuration: 250,
  });

  const learnMenu = nav.createMenu("learn");
  const docsMenu = nav.createMenu("docs");
  const dynamicMenu = nav.createMenu("dynamic");

  const chevronIcon = () =>
    $span(
      { className: "navigation-menu__trigger-indicator" },
      $span({ style: { display: "inline-block", fontSize: "0.75rem", lineHeight: "1" } }, "▼"),
    );

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "NavigationMenu"),
      $span({ className: "card-badge" }, "Floating Primitives"),
    ]),
    $p(
      { className: "card-desc" },
      "A rich website top navigation bar with distinct multi-column sub-menu layouts, a featured hero callout card, dynamic reactive sub-menu actions, direct links, and real-time horizontal/vertical orientation switching.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "navigation-menu-showcase" }, [
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
              $span({ style: { opacity: "0.6" } }, "Active Orientation: "),
              $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 70%)" } }, [
                orientation.as((o) => (o === "horizontal" ? "Horizontal" : "Vertical")),
              ]),
            ]),
            $div([
              $span({ style: { opacity: "0.6" } }, "Active Sub-Menu: "),
              $span({ style: { fontWeight: "600", color: "hsl(142, 71%, 65%)" } }, [
                nav.value.as((v) => v ?? "(None)"),
              ]),
            ]),
            $div([
              $span({ style: { opacity: "0.6" } }, "Last Triggered: "),
              $span({ style: { fontWeight: "600", color: "hsl(45, 93%, 67%)" } }, [lastAction]),
            ]),
          ],
        ),

        // Navigation Menu
        $div(
          {
            style: {
              display: "flex",
              justifyContent: "center",
              width: "100%",
              padding: "1rem 0",
            },
          },
          [
            nav.Root({ className: "navigation-menu-wrapper" }, [
              nav.List({ className: "navigation-menu__root" }, [
                // 1. "Learn" / "Ecosystem" Sub-Menu (Content 1: Callout on Left + Stacked Links on Right)
                nav.Menu({ value: "learn" }, [
                  learnMenu.Trigger({ className: "navigation-menu__trigger" }, ["Learn", chevronIcon()]),
                  learnMenu.Content({ className: "navigation-menu__content content-1" }, [
                    // Left Column: Hero Callout
                    learnMenu.Item(
                      {
                        as: "a",
                        href: "https://github.com",
                        target: "_blank",
                        className: "navigation-menu__item-callout",
                        onclick: () => lastAction("Selected Seidr Hero Callout"),
                      },
                      [
                        $img({
                          src: "/seidr-logo.svg",
                          alt: "Seidr",
                          style: { width: "45px", height: "45px" },
                        }),
                        learnMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Seidr"),
                        learnMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Single-pass reactive framework with fine-grained DOM binding and zero virtual DOM overhead.",
                        ),
                      ],
                    ),
                    // Right Column: Module Links
                    learnMenu.Item(
                      {
                        as: "a",
                        href: "#core",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Selected Seidr Core"),
                      },
                      [
                        learnMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Seidr Core"),
                        learnMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Fine-grained values, reactive element factories ($), and control flows.",
                        ),
                      ],
                    ),
                    learnMenu.Item(
                      {
                        as: "a",
                        href: "#ui",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Selected Seidr UI"),
                      },
                      [
                        learnMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Seidr UI"),
                        learnMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Headless, accessible UI primitives with strict semantic CSS annotations.",
                        ),
                      ],
                    ),
                    learnMenu.Item(
                      {
                        as: "a",
                        href: "#examples",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Selected Example Apps"),
                      },
                      [
                        learnMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Example Apps"),
                        learnMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Explore TodoMVC, Pomodoro, Particles, and SSR examples.",
                        ),
                      ],
                    ),
                  ]),
                ]),

                // 2. "Documentation" Sub-Menu (Content 2: 2-Column Grid)
                nav.Menu({ value: "docs" }, [
                  docsMenu.Trigger({ className: "navigation-menu__trigger" }, ["Documentation", chevronIcon()]),
                  docsMenu.Content({ className: "navigation-menu__content content-2" }, [
                    docsMenu.Item(
                      {
                        as: "a",
                        href: "#intro",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Opened Introduction"),
                      },
                      [
                        docsMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Introduction"),
                        docsMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Build high-quality, accessible design systems and web apps.",
                        ),
                      ],
                    ),
                    docsMenu.Item(
                      {
                        as: "a",
                        href: "#getting-started",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Opened Getting Started"),
                      },
                      [
                        docsMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Getting Started"),
                        docsMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "A quick tutorial to get you up and running with Seidr.",
                        ),
                      ],
                    ),
                    docsMenu.Item(
                      {
                        as: "a",
                        href: "#reactivity",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Opened Reactivity"),
                      },
                      [
                        docsMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Reactivity & Values"),
                        docsMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Deep dive into Value<T>, DerivedValue, mergeValues, and Show.",
                        ),
                      ],
                    ),
                    docsMenu.Item(
                      {
                        as: "a",
                        href: "#dom-binding",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Opened DOM Data-Binding"),
                      },
                      [
                        docsMenu.ItemLabel({ className: "navigation-menu__item-label" }, "DOM Data-Binding"),
                        docsMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Attribute binding, element factories, and automatic scope cleanup.",
                        ),
                      ],
                    ),
                    docsMenu.Item(
                      {
                        as: "a",
                        href: "#ssr",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Opened SSR & Hydration"),
                      },
                      [
                        docsMenu.ItemLabel({ className: "navigation-menu__item-label" }, "SSR & Hydration"),
                        docsMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Deterministic AppState sequence IDs and isomorphic execution.",
                        ),
                      ],
                    ),
                    docsMenu.Item(
                      {
                        as: "a",
                        href: "#changelog",
                        className: "navigation-menu__item",
                        onclick: () => lastAction("Opened Changelog"),
                      },
                      [
                        docsMenu.ItemLabel({ className: "navigation-menu__item-label" }, "Changelog"),
                        docsMenu.ItemDescription(
                          { className: "navigation-menu__item-description" },
                          "Seidr releases, bug fixes, and feature additions.",
                        ),
                      ],
                    ),
                  ]),
                ]),

                // 3. "Dynamic Actions" Sub-Menu (Demonstrates Reactive Sub-menu State)
                nav.Menu({ value: "dynamic" }, [
                  dynamicMenu.Trigger({ className: "navigation-menu__trigger" }, ["Actions", chevronIcon()]),
                  dynamicMenu.Content({ className: "navigation-menu__content content-dynamic" }, [
                    // Dynamic Toolbar
                    $div({ className: "nav-dynamic-toolbar" }, [
                      $span(
                        { style: { fontSize: "0.82rem", fontWeight: "600", opacity: "0.8" } },
                        dynamicActions.as((items) => `${items.length} Registered Actions`),
                      ),
                      $div({ style: { display: "flex", gap: "0.4rem" } }, [
                        $button(
                          {
                            className: "nav-dynamic-btn",
                            onclick: (e: MouseEvent) => {
                              e.stopPropagation();
                              addAction();
                            },
                          },
                          "+ Add Action",
                        ),
                        $button(
                          {
                            className: "nav-dynamic-btn",
                            style: { color: "#f87171", borderColor: "#f8717140" },
                            onclick: (e: MouseEvent) => {
                              e.stopPropagation();
                              clearActions();
                            },
                          },
                          "Clear",
                        ),
                      ]),
                    ]),

                    // List of actions or empty state
                    Show(
                      dynamicActions.as((items) => items.length === 0),
                      () =>
                        $div({ className: "content-empty" }, [
                          $span({ style: { fontSize: "1.5rem" } }, "📭"),
                          $span("No custom actions registered."),
                          $span(
                            { style: { fontSize: "0.78rem", opacity: "0.6" } },
                            "Click '+ Add Action' above to populate.",
                          ),
                        ]),
                      () =>
                        $div(
                          { style: { display: "flex", flexDirection: "column", gap: "0.4rem" } },
                          List(
                            dynamicActions,
                            (item) => item.id,
                            (itemVal) => {
                              const item = itemVal();
                              return dynamicMenu.Item(
                                {
                                  value: item.id,
                                  className: "navigation-menu__item",
                                  style: { display: "flex", alignItems: "center", justifyContent: "space-between" },
                                  onclick: () => lastAction(`Triggered: ${item.title}`),
                                },
                                [
                                  $div([
                                    dynamicMenu.ItemLabel({ className: "navigation-menu__item-label" }, item.title),
                                    dynamicMenu.ItemDescription(
                                      { className: "navigation-menu__item-description" },
                                      item.description,
                                    ),
                                  ]),
                                  $span(
                                    {
                                      style: {
                                        fontSize: "0.72rem",
                                        fontWeight: "600",
                                        padding: "0.2rem 0.5rem",
                                        borderRadius: "4px",
                                        backgroundColor: "#0284c725",
                                        color: "#38bdf8",
                                      },
                                    },
                                    item.badge,
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                    ),
                  ]),
                ]),

                // 4. Direct Link: GitHub
                nav.Menu({ value: "github" }, [
                  nav.Link(
                    {
                      className: "navigation-menu__trigger",
                      href: "https://github.com",
                      target: "_blank",
                      onclick: () => lastAction("Opened GitHub"),
                    },
                    "GitHub ↗",
                  ),
                ]),
              ]),
              nav.Viewport({ className: "navigation-menu__viewport" }, [
                nav.Arrow({ className: "navigation-menu__arrow" }),
              ]),
            ]),
          ],
        ),

        // Section 2: Interactive Orientation Switch using RadioGroup
        $div({ className: "nav-controls-card" }, [
          $h3({ className: "navigation-menu-section-title" }, "Orientation Control"),
          $p(
            { style: { fontSize: "0.85rem", opacity: "0.75", margin: "0" } },
            "Toggle between horizontal and vertical layouts. Notice the popper placement, roving arrows, and chevron indicators dynamically adapt.",
          ),
          RadioGroup({
            id: "nav-orientation-group",
            value: orientation as ReactiveValue<string>,
            orientation: "horizontal",
            onChange: (val) => orientation(val as MenubarOrientation),
            items: [
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
            ],
          }),
        ]),
      ]),
    ]),

    // Documentation / Usage Examples
    $div({ className: "card-body" }, [
      $h3({ className: "card-subtitle" }, "Multi-Column NavigationMenu Architecture"),
      CodeBlock({
        code: `import { createNavigationMenu } from "@fimbul-works/seidr-ui";

const nav = createNavigationMenu({ orientation: "horizontal" });
const learn = nav.createMenu("learn");
const docs = nav.createMenu("docs");

nav.Root({}, [
  nav.List({ className: "navigation-menu__root" }, [
    // Sub-menu 1: Asymmetric Hero Callout + Links
    nav.Menu({ value: "learn" }, [
      learn.Trigger({ className: "navigation-menu__trigger" }, ["Learn ▼"]),
      learn.Content({ className: "navigation-menu__content content-1" }, [
        learn.Item({ className: "navigation-menu__item-callout", href: "/" }, [
          learn.ItemLabel({}, "Seidr"),
          learn.ItemDescription({}, "Single-pass reactive framework..."),
        ]),
        learn.Item({ className: "navigation-menu__item", href: "/core" }, [
          learn.ItemLabel({}, "Seidr Core"),
        ]),
      ]),
    ]),

    // Sub-menu 2: 2-Column Grid
    nav.Menu({ value: "docs" }, [
      docs.Trigger({ className: "navigation-menu__trigger" }, ["Documentation ▼"]),
      docs.Content({ className: "navigation-menu__content content-2" }, [
        docs.Item({ className: "navigation-menu__item" }, [docs.ItemLabel({}, "Introduction")]),
        docs.Item({ className: "navigation-menu__item" }, [docs.ItemLabel({}, "Getting Started")]),
      ]),
    ]),

    // Direct External Link
    nav.Menu({ value: "github" }, [
      nav.Link({ href: "https://github.com", target: "_blank" }, "GitHub ↗"),
    ]),
  ]),
  nav.Viewport({ className: "navigation-menu__viewport" }),
]);`,
        language: "typescript",
      }),
    ]),
  ]);
});
