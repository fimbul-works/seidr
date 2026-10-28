import { createComponent } from "@fimbul-works/seidr";
import { $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Separator } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./separator.css";

export const SeparatorShowcase = createComponent(() => {
  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Separator"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p(
      { className: "card-desc" },
      'Accessible horizontal or vertical divider. Defaults to native <hr>; non-hr elements receive role="separator".',
    ),
    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ style: { display: "flex", flexDirection: "column", gap: "0.75rem" } }, [
        $span({ style: { fontSize: "0.875rem" } }, "Horizontal Separator:"),
        Separator({ orientation: "horizontal" }),
        $span({ style: { fontSize: "0.875rem" } }, "Inline / Vertical Separator:"),
        $div({ style: { display: "flex", alignItems: "center", gap: "1rem" } }, [
          $span("Home"),
          Separator({ as: "div", orientation: "vertical" }),
          $span("Components"),
          Separator({ as: "div", orientation: "vertical" }),
          $span("Showcase"),
        ]),
      ]),
    ]),
    CodeBlock(
      `import { Separator } from "@fimbul-works/seidr-ui";

// Horizontal divider (renders <hr>)
Separator();

// Vertical divider (renders <div role="separator" data-orientation="vertical">)
Separator({ as: "div", orientation: "vertical" });`,
    ),
  ]);
}, "SeparatorShowcase");
