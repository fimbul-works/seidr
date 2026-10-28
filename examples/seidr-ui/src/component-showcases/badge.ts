import { createComponent } from "@fimbul-works/seidr";
import { $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Badge } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./badge.css";

export const BadgeShowcase = createComponent(() => {
  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Badge"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p(
      { className: "card-desc" },
      'Small status indicator with role="status" and optional textValue for screen-reader clarity.',
    ),
    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ style: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" } }, [
        Badge("Default"),
        Badge({ className: "success" }, "Active"),
        Badge({ className: "danger", textValue: "3 unresolved issues" }, "3"),
        Badge({ as: "div" }, "Custom Div Tag"),
      ]),
    ]),
    CodeBlock(
      `import { Badge } from "@fimbul-works/seidr-ui";

// Status badge
Badge({ className: "success" }, "Active");

// Badge with accessible label for icon or number counts
Badge({ textValue: "3 unread messages" }, "3");`,
    ),
  ]);
}, "BadgeShowcase");
