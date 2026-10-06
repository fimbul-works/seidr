import { createComponent, Link } from "@fimbul-works/seidr";
import { $a, $div, $img, $nav, $span } from "@fimbul-works/seidr/html";

/**
 * Page header component.
 */
export const Header = createComponent(
  () =>
    $nav({ className: "navbar" }, [
      Link({ to: "/", className: "brand filter-glow", activeClass: "active" }, [
        $img({ src: "/seidr-logo.svg", alt: "Seidr", className: "brand-logo filter-glow" }),
        $span({ className: "brand-title filter-glow", textContent: "Blog" }),
      ]),
      $div({ className: "links" }, [
        Link({ to: "/", className: "nav-link", activeClass: "active" }, "Articles"),
        $a(
          {
            href: "https://github.com/fimbul-works/seidr",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "nav-link github-link",
          },
          [$span({ className: "icon icon-github" }), "GitHub ↗"],
        ),
      ]),
    ]),
  "Header",
);
