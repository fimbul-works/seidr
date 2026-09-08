import { createComponent } from "@fimbul-works/seidr";
import { $a, $div, $nav } from "@fimbul-works/seidr/html";
import { Link } from "@fimbul-works/seidr/router";

/**
 * Page header component.
 */
export const Header = createComponent(
  () =>
    $nav({ className: "navbar" }, [
      Link({ to: "/", className: "brand" }, "Seidr Blog"),
      $div({ className: "links" }, [
        Link({ to: "/" }, "Home"),
        $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank", rel: "noopener noreferrer" }, "GitHub"),
      ]),
    ]),
  "Header",
);
