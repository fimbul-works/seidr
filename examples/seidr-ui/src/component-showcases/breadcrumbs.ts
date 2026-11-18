import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Breadcrumbs, createBreadcrumbs } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import CaretRightIcon from "../icons/caret-right.svg";
import HouseIcon from "../icons/house.svg";
import "./breadcrumbs.css";

export const BreadcrumbsShowcase = createComponent(() => {
  // Demo 3: Interactive dynamic path state
  const availableSegments = ["packages", "seidr-ui", "src", "breadcrumbs", "showcase"];
  const dynamicSegments = createValue<string[]>(["packages", "seidr-ui", "src"]);

  const dynamicItems = dynamicSegments.as((segments) => [
    { label: "Home", href: "/" },
    ...segments.map((segment, index) => ({
      label: segment,
      href: `/${segments.slice(0, index + 1).join("/")}`,
      current: index === segments.length - 1,
    })),
  ]);

  const addSegment = () => {
    const current = dynamicSegments();
    if (current.length < availableSegments.length) {
      dynamicSegments([...current, availableSegments[current.length]]);
    }
  };

  const removeSegment = () => {
    const current = dynamicSegments();
    if (current.length > 1) {
      dynamicSegments(current.slice(0, current.length - 1));
    }
  };

  // Demo 4: Fine-grained sculpted coordinator (Tier 2)
  const customBreadcrumbs = createBreadcrumbs({
    separator: "/",
    ariaLabel: "Store Navigation",
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Breadcrumbs"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "WAI-ARIA compliant hierarchical breadcrumb navigation (<nav aria-label='Breadcrumbs'>) supporting automatic separators, reactive item collections, polymorphic custom elements, and fine-grained DOM sculpting.",
    ),

    // Live Previews
    $div({ className: "preview-box" }, [
      $div({ className: "breadcrumbs-showcase" }, [
        // 1. Standard Breadcrumbs
        $div({ className: "breadcrumbs-card" }, [
          $span({ className: "breadcrumbs-heading" }, "1. Standard Breadcrumbs (Items Array)"),
          $span(
            { className: "breadcrumbs-hint" },
            "Default slash ('/') separator. The final item represents the active page with aria-current='page' and data-current.",
          ),
          Breadcrumbs({
            items: [
              { label: "Home", href: "/" },
              { label: "Components", href: "/components" },
              { label: "Navigation", href: "/components/navigation" },
              { label: "Breadcrumbs", current: true },
            ],
          }),
        ]),

        // 2. Custom Icon Separator & Leading Icon
        $div({ className: "breadcrumbs-card" }, [
          $span({ className: "breadcrumbs-heading" }, "2. Custom Icon Separator & Leading Icon"),
          $span(
            { className: "breadcrumbs-hint" },
            "Pass an SVG icon or any SeidrChild as the separator prop and compose rich labels.",
          ),
          Breadcrumbs({
            separator: CaretRightIcon({ className: "breadcrumb-chevron" }),
            items: [
              {
                label: $span({ className: "breadcrumb-home-label" }, [
                  HouseIcon({ className: "breadcrumb-icon" }),
                  "Home",
                ]),
                href: "/",
              },
              { label: "Settings", href: "/settings" },
              { label: "Account", href: "/settings/account" },
              { label: "Security & Privacy", current: true },
            ],
          }),
        ]),

        // 3. Reactive Dynamic Path
        $div({ className: "breadcrumbs-card" }, [
          $span({ className: "breadcrumbs-heading" }, "3. Reactive Dynamic Path"),
          $span(
            { className: "breadcrumbs-hint" },
            "Binds to a reactive Value observable. Path additions and removals update fine-grained list items without re-rendering.",
          ),
          $div({ className: "controls-row" }, [
            $button(
              {
                className: "control-btn",
                onclick: addSegment,
                disabled: dynamicSegments.as((s) => s.length >= availableSegments.length),
              },
              "+ Append Segment",
            ),
            $button(
              {
                className: "control-btn",
                onclick: removeSegment,
                disabled: dynamicSegments.as((s) => s.length <= 1),
              },
              "- Remove Segment",
            ),
          ]),
          Breadcrumbs({
            separator: CaretRightIcon({ className: "breadcrumb-chevron" }),
            items: dynamicItems,
          }),
        ]),

        // 4. Fine-Grained Coordinator (Tier 2)
        $div({ className: "breadcrumbs-card" }, [
          $span({ className: "breadcrumbs-heading" }, "4. Fine-Grained Coordinator (createBreadcrumbs)"),
          $span(
            { className: "breadcrumbs-hint" },
            "Fine-grained control over the DOM composition tree using Root, List, Item, Link, and Separator primitives.",
          ),
          customBreadcrumbs.Root([
            customBreadcrumbs.List([
              customBreadcrumbs.Item([customBreadcrumbs.Link({ href: "/" }, "Catalog"), customBreadcrumbs.Separator()]),
              customBreadcrumbs.Item([
                customBreadcrumbs.Link({ href: "/electronics" }, "Electronics"),
                customBreadcrumbs.Separator(),
              ]),
              customBreadcrumbs.Item([
                customBreadcrumbs.Link({ href: "/electronics/audio" }, "Audio"),
                customBreadcrumbs.Separator(),
              ]),
              customBreadcrumbs.Item([customBreadcrumbs.Link({ current: true }, "Headphones")]),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock({
      language: "typescript",
      code: `import { Breadcrumbs, createBreadcrumbs } from "@fimbul-works/seidr-ui";
import CaretRightIcon from "./icons/caret-right.svg";

// 1. All-in-One Component with declarative items
Breadcrumbs({
  items: [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumbs", current: true },
  ],
});

// 2. Custom icon separator
Breadcrumbs({
  separator: CaretRightIcon({ className: "w-4 h-4" }),
  items: [
    { label: "Home", href: "/" },
    { label: "Settings", href: "/settings" },
    { label: "Profile", current: true },
  ],
});

// 3. Reactive observable items (List fine-grained reactivity)
const items = createValue([
  { label: "Home", href: "/" },
  { label: "Folder", current: true },
]);
Breadcrumbs({ items });

// 4. Fine-grained Tier 2 coordinator
const breadcrumbs = createBreadcrumbs({ separator: "/" });
breadcrumbs.Root([
  breadcrumbs.List([
    breadcrumbs.Item([breadcrumbs.Link({ href: "/" }, "Home"), breadcrumbs.Separator()]),
    breadcrumbs.Item([breadcrumbs.Link({ current: true }, "Active Page")]),
  ]),
]);`,
    }),
  ]);
}, "BreadcrumbsShowcase");
