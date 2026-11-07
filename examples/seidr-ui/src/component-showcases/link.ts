import { createComponent, createValue, getCurrentUrl } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Link } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./link.css";

export const LinkShowcase = createComponent(() => {
  const isLinkDisabled = createValue(false);
  const currentUrl = getCurrentUrl();

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Link"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p(
      { className: "card-desc" },
      "WAI-ARIA compliant hyperlink component. Integrates with Seidr's centralized navigation system, tracks active state via data-current & aria-current, and supports polymorphic custom elements.",
    ),
    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isLinkDisabled.as((d) => `control-btn ${d ? "active" : ""}`),
            onclick: () => isLinkDisabled(!isLinkDisabled()),
          },
          isLinkDisabled.as((d) => (d ? "Enable Links" : "Disable Links")),
        ),
        $span(
          { style: { fontSize: "0.85rem", color: "var(--fg-muted)" } },
          currentUrl.as((u) => `Current URL: ${u.pathname}`),
        ),
      ]),
      $div({ className: "link-showcase-group" }, [
        Link(
          {
            href: "/components/link",
            disabled: isLinkDisabled,
            activeClass: "link-active",
          },
          "Active Link (/components/link)",
        ),
        Link(
          {
            href: "/components/button",
            disabled: isLinkDisabled,
            activeClass: "link-active",
          },
          "Internal Link (/components/button)",
        ),
        Link(
          {
            as: "span",
            href: "/components/dialog",
            disabled: isLinkDisabled,
            activeClass: "link-active",
          },
          "Polymorphic <span> Link",
        ),
        Link(
          {
            href: "https://github.com/fimbul-works/seidr",
            target: "_blank",
            rel: "noopener noreferrer",
            disabled: isLinkDisabled,
          },
          "External Link (GitHub ↗)",
        ),
      ]),
    ]),
    CodeBlock({
      language: "typescript",
      code: `import { Link } from "@fimbul-works/seidr-ui";

// Standard SPA Link (auto-routes through centralized navigate)
Link({ href: "/docs" }, "Documentation");

// With active/inactive styling and aria-current
Link({
  href: "/dashboard",
  activeClass: "active",
  inactiveClass: "inactive",
}, "Dashboard");

// Polymorphic element with keyboard support (Enter triggers click)
Link({ as: "span", href: "/profile" }, "Profile");

// Reactive disabled state (removes href and adds aria-disabled="true")
Link({ href: "/settings", disabled: isLocked }, "Settings");`,
    }),
  ]);
}, "LinkShowcase");

