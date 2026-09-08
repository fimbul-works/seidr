import { createComponent } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { Link } from "@fimbul-works/seidr/router";

/**
 * 404 Not Found page component.
 */
export const NotFoundPage = createComponent(
  () =>
    $div({ className: "error not-found-page" }, [
      $div({}, "Page not found"),
      Link({ to: "/" }, "← Back to home"),
    ]),
  "NotFoundPage",
);
