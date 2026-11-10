import { createComponent } from "@fimbul-works/seidr";
import { $div, $h1, $p } from "@fimbul-works/seidr/html";
import { Link } from "@fimbul-works/seidr-ui";

/**
 * 404 Not Found page component.
 */
export const NotFoundPage = createComponent(
  () =>
    $div({ className: "error not-found-card" }, [
      $h1({ className: "error-title" }, "Page Not Found"),
      $p({ className: "error-message" }, "The requested path could not be resolved."),
      Link({ href: "/", className: "btn btn-primary" }, "← Return to Articles"),
    ]),
  "NotFoundPage",
);
