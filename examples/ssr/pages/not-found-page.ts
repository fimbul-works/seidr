import { createComponent, Link } from "@fimbul-works/seidr";
import { $div, $h1, $p } from "@fimbul-works/seidr/html";

/**
 * 404 Not Found page component.
 */
export const NotFoundPage = createComponent(
  () =>
    $div({ className: "not-found-card" }, [
      $h1({ className: "error-title" }, "404 • Page Not Found"),
      $p({ className: "error-message" }, "The requested path could not be resolved by the Seidr Router."),
      Link({ to: "/", className: "btn btn-primary" }, "← Return to Articles"),
    ]),
  "NotFoundPage",
);
