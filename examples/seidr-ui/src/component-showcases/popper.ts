import { createComponent, createRef, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createPopper, type Placement, Popper } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./popper.css";

export const PopperShowcase = createComponent(() => {
  const selectedPlacement = createValue<Placement>("bottom");
  const isVisible = createValue<boolean>(true);

  const anchorRef = createRef<HTMLButtonElement>();

  const popper = createPopper({
    anchorRef,
    placement: "bottom",
    gutter: 8,
    flip: true,
    slide: true,
  });

  selectedPlacement.watch((next) => {
    popper.currentPlacement(next);
    void popper.updatePosition();
  });

  const placements: Placement[] = [
    "top",
    "top-start",
    "top-end",
    "bottom",
    "bottom-start",
    "bottom-end",
    "left",
    "right",
  ];

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Popper"),
      $span({ className: "card-badge" }, "Foundation"),
    ]),
    $p(
      { className: "card-desc" },
      "A floating element positioning engine powered by Floating UI. Handles 12 anchor placements, collision flipping, edge sliding, transform-origin calculation, and reactive SVG arrows for Select, Combobox, Popover, and Tooltip.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "popper-showcase" }, [
        $div({ className: "popper-section-box" }, [
          $h3({ className: "popper-heading" }, "Interactive Placement Controls"),
          $div(
            { className: "popper-controls-row" },
            placements.map((p) =>
              $button(
                {
                  className: "popper-pill-btn",
                  dataActive: selectedPlacement.as((curr) => (curr === p ? "" : undefined)),
                  onclick: () => selectedPlacement(p),
                },
                p,
              ),
            ),
          ),
        ]),

        $div({ className: "popper-section-box", style: { minHeight: "180px", position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" } }, [
          $button(
            {
              ref: anchorRef,
              className: "popper-anchor-button",
              onclick: () => {
                isVisible(!isVisible());
                void popper.updatePosition();
              },
            },
            "Anchor Element (Click to Toggle)",
          ),

          popper.Root({ style: { display: isVisible.as((v) => (v ? "block" : "none")) } }, [
            popper.Positioner({}, [
              popper.Arrow(),
              $div(
                { className: "popper-tooltip-content" },
                [
                  "Popper Positioned: ",
                  $span({ style: { fontWeight: "600", color: "hsl(217, 91%, 70%)" } }, [
                    popper.currentPlacement,
                  ]),
                ],
              ),
            ]),
          ]),
        ]),
      ]),
    ]),

    // Usage Examples
    CodeBlock({
      language: "typescript",
      code: `import { createPopper, Popper } from "@fimbul-works/seidr-ui";

// 1. All-in-One Component (Tier 1)
Popper({
  anchorRef: triggerRef,
  placement: "bottom-start",
  gutter: 8,
  showArrow: true,
  children: [
    $("div", { className: "my-dropdown" }, "Dropdown Content"),
  ],
});

// 2. Fine-Grained Coordinator (Tier 2)
const popper = createPopper({
  anchorRef: triggerRef,
  placement: "bottom",
  gutter: 6,
  flip: true,
  sameWidth: true,
});

popper.Root({}, [
  popper.Positioner({}, [
    popper.Arrow(),
    $("div", { className: "menu-content" }, "Floating Content"),
  ]),
]);`,
    }),
  ]);
}, "PopperShowcase");

